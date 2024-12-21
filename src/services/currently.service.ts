import type { FilterQuery } from 'mongoose'

import { CurrentlyModel, CurrentlyDocument } from '../models/currently.model'
import { CurrentlyUpdateTypes, type CurrentlyPlace, type CurrentlyQueryOptions, type CurrentlyRequest, type CurrentlyResponse, type CurrentlyStatus, type CurrentlyTag, type CurrentlyUpdate } from '../types/currently.types'
import { InternalServerError } from './errors'
import { UserV2Model } from '../models/user-v2.model'
import { getMappingListOfWalletToUserToken, getUserTokenWithDisplayName } from './user-v2.service'
import { mapCurrentlyResponse } from '../util/currentlyUtil'


export async function createCurrentlyInDB(currentlyData: Partial<CurrentlyRequest>): Promise<CurrentlyResponse | null> {
  try {
    // TODO: do place DB stuff

    const currentlyBuildData = {
      senderPrimaryWallet: currentlyData.senderPrimaryWallet as string,
      place: currentlyData.place as CurrentlyPlace,
      wantOthersToKnowTags: currentlyData.wantOthersToKnowTags as CurrentlyTag[],
      status: currentlyData.status as CurrentlyStatus,
    }
    const currentlyDoc = CurrentlyModel.build(currentlyBuildData)
    const createdCurrently = await CurrentlyModel.create(currentlyDoc)

    const senderUserDoc = await UserV2Model.findOne({ primaryWallet: createdCurrently?.senderPrimaryWallet })
    const senderUserWithDisplayName = await getUserTokenWithDisplayName(senderUserDoc, currentlyData.senderPrimaryWallet as string)

    return createdCurrently ? mapCurrentlyResponse(createdCurrently, senderUserWithDisplayName) : null
  } catch (error) {
    console.error('error occurred while creating Currently in DB', error)
    throw new Error('failed to create Currently in DB')
  }
}

export async function fetchCurrentlyFromDB({
  requestingPrimaryWallet,
  currentlyID,
}: {
  requestingPrimaryWallet: string
  currentlyID: string
}): Promise<CurrentlyResponse | null> {
  try {
    const currentlyDoc = await CurrentlyModel.findOne({
      $or: [
        { _id: currentlyID && currentlyID !== '' ? currentlyID : null, },
        // {
        //   $and: [
        //     { eventName: { $regex: new RegExp("^" + eventName + "$", 'iu') } },
        //     { eventCreator: { $regex: new RegExp("^" + eventCreator + "$", 'iu') } }
        //   ]
        // }
      ],
    })

    const senderUserDoc = await UserV2Model.findOne({ primaryWallet: currentlyDoc?.senderPrimaryWallet })
    const senderUserWithDisplayName = await getUserTokenWithDisplayName(senderUserDoc, requestingPrimaryWallet)

    return currentlyDoc ? mapCurrentlyResponse(currentlyDoc as any, senderUserWithDisplayName) : null
  } catch (error) {
    console.error('error occurred while fetching Currently from DB', error)
    throw new InternalServerError('failed to fetch Currently from DB')
  }
}

export async function fetchAllCurrentlyFromDB(options: CurrentlyQueryOptions): Promise<CurrentlyResponse[]> {
  try {
    const { skip, limit, orderBy, search, senderPrimaryWallet, requestingPrimaryWallet } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<CurrentlyDocument>[] = []

    if (senderPrimaryWallet) {
      filterOptions.push({
        $or: [
          { senderPrimaryWallet: { $regex: new RegExp("^" + senderPrimaryWallet + "$", 'iu') } },
        ],
      })
    }
    if (search) {
      filterOptions.push({
        $or: [
          { senderPrimaryWallet: { $regex: new RegExp(search, 'iu') } },
          // TODO: tbh place would be best to search by here
          { status: { $regex: new RegExp(search, 'iu') } },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const currentlyDocs = await CurrentlyModel.aggregate([
      { $match: filterQuery },
      { $lookup: {
          from: 'userv2', // The name of the UserV2 collection
          localField: 'senderPrimaryWallet', // Field from Currently
          foreignField: 'primaryWallet', // Field from UserV2 to match against
          as: 'senderUser' // Output array field
        }
      },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limit }
    ])

    // get userTokens for each wallet (also handles calculatedDisplayName of each user relative to requestingPrimaryWallet)
    const fieldMapping = {
      senderPrimaryWallet: 'senderUser',
    }
    const userWithDisplayNameMap = await getMappingListOfWalletToUserToken(currentlyDocs, fieldMapping, requestingPrimaryWallet)
  
    return currentlyDocs.map(doc => {
      const senderUser = userWithDisplayNameMap[doc.senderPrimaryWallet]
      return mapCurrentlyResponse(doc, senderUser) as CurrentlyResponse
    })
  } catch (error) {
    console.error('error occurred while fetching all Currently from DB', error)
    throw new Error('failed to fetch all Currently from DB')
  }
}

export async function updateCurrentlyInDB(
  // currentlyID: string,
  updates: CurrentlyUpdate[],
  requestingPrimaryWallet: string,
): Promise<CurrentlyDocument | null> {
  try {
    // Step 1: Fetch the existing record
    // frontend should handle logic of if last currently expired and if so, use create route instead of update route
    const existingCurrently = await CurrentlyModel.findOne({}).sort({ createdAt: -1 }).exec() as any

    if (!existingCurrently) {
      throw new Error('existing Currently record to update not found')
    }

    // create a new object that only includes the fields desired (excludes stuff like _id)
    const filteredCurrently = {
      senderPrimaryWallet: existingCurrently.senderPrimaryWallet,
      place: existingCurrently.place,
      wantOthersToKnowTags: existingCurrently.wantOthersToKnowTags,
      status: existingCurrently.status,
    }

    // Step 2: Process each update
    updates.forEach(update => {
      switch (update.updateType) {
        case CurrentlyUpdateTypes.EDIT_PLACE_TEXT:
          // rn set up so user cannot edit a field, unless it already exists, so that avoids null errors
          filteredCurrently.place.text = update.newValue
          break

        case CurrentlyUpdateTypes.EDIT_PLACE_DURATION:
          filteredCurrently.place.duration = update.newValue
          filteredCurrently.place.updatedDurationAt = new Date()
          break

        case CurrentlyUpdateTypes.NEW_PLACE:
          filteredCurrently.place = { text: update.newValue.text, duration: update.newValue.duration, updatedDurationAt: new Date() }
          break

        case CurrentlyUpdateTypes.DELETE_PLACE:
          filteredCurrently.place = null // Or handle as needed
          break

        case CurrentlyUpdateTypes.NEW_TAG:
          filteredCurrently.wantOthersToKnowTags.push({ tag: update.newValue.text, duration: update.newValue.duration, updatedDurationAt: new Date() })
          break

        case CurrentlyUpdateTypes.EDIT_TAG_TEXT:
          const tagToEdit = filteredCurrently.wantOthersToKnowTags.find((tag: CurrentlyTag) => tag.tag === update.target)
          if (tagToEdit) {
            tagToEdit.tag = update.newValue // actually modifies original object in array
          }
          break

        case CurrentlyUpdateTypes.EDIT_TAG_DURATION:
          const tagDurationToEdit = filteredCurrently.wantOthersToKnowTags.find((tag: CurrentlyTag) => tag.tag === update.target)
          if (tagDurationToEdit) {
            tagDurationToEdit.duration = update.newValue
            tagDurationToEdit.updatedDurationAt = new Date()
          }
          break

        case CurrentlyUpdateTypes.DELETE_TAG:
          filteredCurrently.wantOthersToKnowTags = filteredCurrently.wantOthersToKnowTags.filter((tag: CurrentlyTag) => tag.tag !== update.target)
          break

        case CurrentlyUpdateTypes.NEW_STATUS:
          filteredCurrently.status = { text: update.newValue.text, duration: update.newValue.duration, updatedDurationAt: new Date() }
          break

        case CurrentlyUpdateTypes.EDIT_STATUS_TEXT:
          filteredCurrently.status.text = update.newValue
          break

        case CurrentlyUpdateTypes.EDIT_STATUS_DURATION:
          filteredCurrently.status.duration = update.newValue
          filteredCurrently.status.updatedDurationAt = new Date()
          break

        case CurrentlyUpdateTypes.DELETE_STATUS:
          filteredCurrently.status = null
          break

        case CurrentlyUpdateTypes.CLEAR_ALL:
          filteredCurrently.place = null
          filteredCurrently.wantOthersToKnowTags = []
          filteredCurrently.status = null
          break

        default:
          throw new Error('invalid update type')
      }
    })

    // Step 3: Create a new record with the merged data
    const newCurrentlyRecord = CurrentlyModel.build((filteredCurrently as CurrentlyDocument))
    const createdCurrently = await CurrentlyModel.create(newCurrentlyRecord)

    return createdCurrently
  } catch (error) {
    console.error('error occurred while updating Currently record in DB', error)
    throw new InternalServerError('failed to update Currently record in DB')
  }
}

export async function deleteCurrentlyInDB(currentlyID: string): Promise<void> {
  try {
    await CurrentlyModel.findOneAndDelete({
      _id: currentlyID,
      // eventCreator: eventCreator
    })
  } catch (error) {
    console.error('error occurred while deleting DefinedEvent from DB', error)
    throw new InternalServerError('failed to delete DefinedEvent from DB')
  }
}
