import type { FilterQuery } from 'mongoose'

import { CurrentlyModel, CurrentlyDocument } from '../models/currently.model'
import { CurrentlyUpdateTypes, type CurrentlyPlace, type CurrentlyQueryOptions, type CurrentlyRequest, type CurrentlyResponse, type CurrentlyStatus, type CurrentlyTag, type CurrentlyUpdate } from '../types/currently.types'
import { InternalServerError } from './errors'
import { UserV2Model } from '../models/user-v2.model'
import { getMappingListOfWalletToUserToken, getUserTokenWithDisplayName } from './user-v2.service'
import { mapCurrentlyResponse } from '../util/currentlyUtil'
import { createPlaceInDB, fetchPlaceFromDB, updatePlaceInDB } from './place.service'
import { SavedPersonModel } from '../models/saved-person.model'
import { createDefinedEventInDB } from './defined-event.service'
import { SAVED_SYMBOL_TYPES } from '../util/definedEventUtil'
import { NOTIF_TYPE } from '../models/emote-notif.model'
import { notifyFollowersOfEvent } from '../services/pingppl-follow.service'


export async function createCurrentlyInDB(currentlyData: Partial<CurrentlyRequest>): Promise<CurrentlyResponse | null> {
  try {
    // do place DB stuff if currently has place data
    if (currentlyData.place) {
      // check if place exists already
      let place = await fetchPlaceFromDB({
        placeName: currentlyData.place.text,
      })

      if (!place) {
        // create new place if it doesn't exist
        place = await createPlaceInDB({
          placeName: currentlyData.place.text,
          visitCount: 1
        })
      } else {
        // update visit count if place exists
        await updatePlaceInDB(place.id)
      }
    }

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

    // Only notify followers if there's a place
    if (currentlyBuildData.place) {
      notifyFollowersOfEvent(
        currentlyBuildData.place.text,
        currentlyBuildData.senderPrimaryWallet,
        NOTIF_TYPE.CURRENTLY_SHARED,
        createdCurrently._id.toString(),
        mapCurrentlyResponse(createdCurrently, senderUserWithDisplayName),
        currentlyBuildData.senderPrimaryWallet,
      )
    }

    // Notify followers for each tag
    if (currentlyBuildData.wantOthersToKnowTags?.length > 0) {
      Promise.all(
        currentlyBuildData.wantOthersToKnowTags.map(tag =>
          notifyFollowersOfEvent(
            tag.tag,
            currentlyBuildData.senderPrimaryWallet,
            NOTIF_TYPE.CURRENTLY_SHARED,
            createdCurrently._id.toString(),
            mapCurrentlyResponse(createdCurrently, senderUserWithDisplayName),
            currentlyBuildData.senderPrimaryWallet,
          )
        )
      ).catch(error => {
        console.error('Error sending notifications:', error)
      })
    }

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
    const { skip, limit, orderBy, search, senderPrimaryWallet, requestingPrimaryWallet, anyActiveField, placeName, anyActivePlace, filterBySavedPeopleOfRequestingUser } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1
    const currentTime = new Date()

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<CurrentlyDocument>[] = []

    if (filterBySavedPeopleOfRequestingUser) {
      // Fetch all saved people for the requesting user
      const savedPeople = await SavedPersonModel.find({ 
        savedBy: requestingPrimaryWallet 
      })
      
      const savedWallets = savedPeople.map(sp => sp.primaryWalletSaved)
      
      filterOptions.push({
        senderPrimaryWallet: { $in: savedWallets }
      })
    } else if (senderPrimaryWallet) {
      filterOptions.push({
        $or: [
          { senderPrimaryWallet: { $regex: new RegExp("^" + senderPrimaryWallet + "$", 'iu') } },
        ],
      })
    }

    if (search) {
      // Get saved people for requesting user
      const savedPeople = await SavedPersonModel.find({ 
        savedBy: requestingPrimaryWallet 
      })
      
      // Just use saved people's wallets for initial filtering
      const matchingWallets = savedPeople.map(sp => sp.primaryWalletSaved)
      
      filterOptions.push({
        $or: [
          { 'status.text': { $regex: new RegExp(search, 'iu') } },
          { 'place.text': { $regex: new RegExp(search, 'iu') } },
          { 'wantOthersToKnowTags.tag': { $regex: new RegExp(search, 'iu') } },
          { senderPrimaryWallet: { $regex: new RegExp(search, 'iu') } },
          { senderPrimaryWallet: { $in: matchingWallets } }
        ]
      })
    }

    // filter for currently records that have at least 1 active field (place, tag, or status) based on duration
    // be careful: if you just want records active for PLACE, dont use this bc this will return records if PLACE, TAGS, or STATUS are active (even if PLACE is not active)
    if (anyActiveField) {
      filterOptions.push({
        $or: [
          {
            $expr: {
              $lt: [
                currentTime,
                { $add: ['$place.updatedDurationAt', '$place.duration'] }
              ]
            }
          },
          // this gets records with ANY active tags. Filter below that is stage and not part of filterOptions is what removes tags from SOLO records that are NOT ACTIVE
          {
            $expr: {
              $gt: [
                { $size: { 
                  $filter: { 
                    input: "$wantOthersToKnowTags", 
                    as: "item", 
                    cond: { 
                      $lt: [
                        currentTime,
                        { $add: ['$$item.updatedDurationAt', '$$item.duration'] }
                      ] 
                    } 
                  } 
                }},
                0
              ]
            }
          },
          {
            $expr: {
              $lt: [
                currentTime,
                { $add: ['$status.updatedDurationAt', '$status.duration'] },
              ]
            }
          },
        ],
      })

    }

    // fetch all currently records at a specific place. if you only want the active ones, then also use anyActivePlace
    if (placeName) {
      filterOptions.push({
        'place.text': { $regex: new RegExp("^" + placeName + "$", 'iu') }
      })
    }

    // fetch all currently records that have an active place rn (dont use this with anyActiveField or wont work)
    if (anyActivePlace) {
      filterOptions.push({ 
        place: { $exists: true, $ne: null },
        $expr: {
          $lt: [
            currentTime,
            { $add: ['$place.updatedDurationAt', '$place.duration'] }
          ]
        }
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const currentlyDocs = await CurrentlyModel.aggregate([
      {
        $sort: {
          updatedAt: -1
        }
      },
      // if anyActivePlace or anyActiveField is true, we need to only fetch one record per senderPrimaryWallet AND it should be the most recent one only
      // the sort above is required for dis to work
      ...(anyActiveField || anyActivePlace ? [
        {
          $group: {
            _id: "$senderPrimaryWallet",
            mostRecentRecord: { $first: "$$ROOT" } // Get the most recent record
          }
        },
        {
          $replaceRoot: { newRoot: "$mostRecentRecord" } // Replace the root with the most recent record
        }
      ] : []),
      { $match: filterQuery },
      // First handle anyActiveField filtering of tags
      ...(anyActiveField ? [{
        $addFields: {
          wantOthersToKnowTags: {
            $filter: {
              input: "$wantOthersToKnowTags",
              as: "tag",
              cond: {
                $lt: [
                  currentTime,
                  { $add: ['$$tag.updatedDurationAt', '$$tag.duration'] }
                ]
              }
            }
          },
          place: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$place", null] },
                  {
                    $lt: [
                      currentTime,
                      { $add: ['$place.updatedDurationAt', '$place.duration'] }
                    ]
                  }
                ]
              },
              then: "$place",
              else: null
            }
          },
          status: {
            $cond: {
              if: {
                $and: [
                  { $ne: ["$status", null] },
                  {
                    $lt: [
                      currentTime,
                      { $add: ['$status.updatedDurationAt', '$status.duration'] }
                    ]
                  }
                ]
              },
              then: "$status",
              else: null
            }
          }
        }
      }] : []),
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
    
    // If searching, we need to do an additional filter for calculatedDisplayName
    // since it's generated at runtime and can't be queried in the DB
    let processedDocs = currentlyDocs
    if (search) {
      processedDocs = currentlyDocs.filter(doc => {
        const senderUser = userWithDisplayNameMap[doc.senderPrimaryWallet]
        return !senderUser || 
               senderUser.calculatedDisplayName.toLowerCase().includes(search.toLowerCase()) ||
               senderUser.chosenPublicName.toLowerCase().includes(search.toLowerCase()) ||
               doc.senderPrimaryWallet.toLowerCase().includes(search.toLowerCase()) ||
               (doc.status?.text && doc.status.text.toLowerCase().includes(search.toLowerCase())) ||
               (doc.place?.text && doc.place.text.toLowerCase().includes(search.toLowerCase())) ||
               (doc.wantOthersToKnowTags?.some((tag: CurrentlyTag) => 
                 tag.tag.toLowerCase().includes(search.toLowerCase())
               ))
      })
    }
  
    return processedDocs.map(doc => {
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
    const existingCurrently = await CurrentlyModel.findOne({ senderPrimaryWallet: requestingPrimaryWallet }).sort({ createdAt: -1 }).exec() as any

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

          if (update.shouldSavePlaceOnShare) {
            createDefinedEventInDB({
              eventCreator: requestingPrimaryWallet,
              eventName: update.newValue.text,
              eventDescription: null,
              savedSymbolTypes: [SAVED_SYMBOL_TYPES.CURRENTLY, SAVED_SYMBOL_TYPES.PLACE],
            })
          }

          // rn set up so user cannot edit a field, unless it already exists, so that avoids null errors
          filteredCurrently.place.text = update.newValue
          break

        case CurrentlyUpdateTypes.EDIT_PLACE_DURATION:

          if (update.shouldSavePlaceOnShare) {
            createDefinedEventInDB({
              eventCreator: requestingPrimaryWallet,
              eventName: update.newValue.text,
              eventDescription: null,
              savedSymbolTypes: [SAVED_SYMBOL_TYPES.CURRENTLY, SAVED_SYMBOL_TYPES.PLACE],
            })
          }

          filteredCurrently.place.duration = update.newValue
          filteredCurrently.place.updatedDurationAt = new Date()
          break

        case CurrentlyUpdateTypes.NEW_PLACE:

          if (update.shouldSavePlaceOnShare) {
            createDefinedEventInDB({
              eventCreator: requestingPrimaryWallet,
              eventName: update.newValue.text,
              eventDescription: null,
              savedSymbolTypes: [SAVED_SYMBOL_TYPES.CURRENTLY, SAVED_SYMBOL_TYPES.PLACE],
            })
          }

          filteredCurrently.place = { text: update.newValue.text, duration: update.newValue.duration, updatedDurationAt: new Date() }
          break

        case CurrentlyUpdateTypes.DELETE_PLACE:
          filteredCurrently.place = null // Or handle as needed
          break

        case CurrentlyUpdateTypes.NEW_TAG:
          filteredCurrently.wantOthersToKnowTags.push({ tag: update.newValue.tag, duration: update.newValue.duration, updatedDurationAt: new Date() })
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

    const senderUserDoc = await UserV2Model.findOne({ primaryWallet: createdCurrently?.senderPrimaryWallet })
    const senderUserWithDisplayName = await getUserTokenWithDisplayName(senderUserDoc, createdCurrently.senderPrimaryWallet as string)

    // Notify for place changes
    if (updates.some(update => 
      [CurrentlyUpdateTypes.NEW_PLACE, CurrentlyUpdateTypes.EDIT_PLACE_TEXT, CurrentlyUpdateTypes.EDIT_PLACE_DURATION].includes(update.updateType)
    ) && filteredCurrently.place) {
      notifyFollowersOfEvent(
        filteredCurrently.place.text,
        filteredCurrently.senderPrimaryWallet,
        NOTIF_TYPE.CURRENTLY_SHARED,
        createdCurrently._id.toString(),
        mapCurrentlyResponse(createdCurrently, senderUserWithDisplayName),
        requestingPrimaryWallet,
      )
    }

    // Notify for tag changes
    const tagUpdates = updates.filter(update => 
      [CurrentlyUpdateTypes.NEW_TAG, CurrentlyUpdateTypes.EDIT_TAG_TEXT, CurrentlyUpdateTypes.EDIT_TAG_DURATION].includes(update.updateType)
    )

    if (tagUpdates.length > 0 && filteredCurrently.wantOthersToKnowTags?.length > 0) {
      // Get modified tags by comparing with update targets
      const modifiedTags = filteredCurrently.wantOthersToKnowTags.filter((tag: CurrentlyTag) =>
        tagUpdates.some(update => 
          update.target === tag.tag || // For edits
          (update.updateType === CurrentlyUpdateTypes.NEW_TAG && update.newValue.tag === tag.tag) // For new tags
        )
      )

      // Notify for each modified tag
      Promise.all(
        modifiedTags.map((tag: CurrentlyTag) =>
          notifyFollowersOfEvent(
            tag.tag,
            filteredCurrently.senderPrimaryWallet,
            NOTIF_TYPE.CURRENTLY_SHARED,
            createdCurrently._id.toString(),
            mapCurrentlyResponse(createdCurrently, senderUserWithDisplayName),
            requestingPrimaryWallet,
          )
        )
      ).catch(error => {
        console.error('Error sending notifications:', error)
      })
    }

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

// bet these will be used eventually
// export const fetchAllActiveCurrently = async (): Promise<CurrentlyResponse[]> => {
//     return fetchAllCurrentlyFromDB({
//         skip: 0,
//         limit: 1000,
//         anyActiveField: true,
//         orderBy: 'createdAt',
//         orderDirection: 'desc'
//     })
// }

// export const fetchAllActivelyAtAnyPlace = async (): Promise<CurrentlyResponse[]> => {
//     return fetchAllCurrentlyFromDB({
//         skip: 0,
//         limit: 1000,
//         anyActivePlace: true,
//         orderBy: 'createdAt',
//         orderDirection: 'desc'
//     })
// }

// export const fetchAllActiveAtSpecificPlace = async (placeName: string): Promise<CurrentlyResponse[]> => {
//     return fetchAllCurrentlyFromDB({
//         skip: 0,
//         limit: 1000,
//         anyActivePlace: true,
//         placeName,
//         orderBy: 'createdAt',
//         orderDirection: 'desc'
//     })
// }
