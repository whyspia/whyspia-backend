import type { FilterQuery } from 'mongoose'

import { mapSavedPersonResponse } from '../util/savedPersonUtil'
import { SavedPersonDocument, SavedPersonModel } from '../models/saved-person.model'
import type { SavedPersonQueryOptions, SavedPersonRequest, SavedPersonResponse } from '../types/saved-person.types'
import { UserV2Model } from '../models/user-v2.model'

export async function createSavedPersonInDB(savedPersonData: Partial<SavedPersonRequest>): Promise<SavedPersonResponse | null> {
  try {
    const savedPersonBuildData = {
      savedBy: savedPersonData.savedBy as string,
      primaryWalletSaved: savedPersonData.primaryWalletSaved as string,
      chosenName: savedPersonData.chosenName as string,
    }
    const savedPersonDoc = SavedPersonModel.build(savedPersonBuildData)
    const createdSavedPerson = await SavedPersonModel.create(savedPersonDoc)

    const primaryWalletSavedUserDoc = await UserV2Model.findOne({ primaryWallet: createdSavedPerson?.primaryWalletSaved })

    return createdSavedPerson ? mapSavedPersonResponse(createdSavedPerson, primaryWalletSavedUserDoc) : null
  } catch (error) {
    console.error('error occurred while creating SavedPerson in DB', error)
    throw new Error('failed to create SavedPerson in DB')
  }
}

export async function fetchSavedPersonFromDB({
  requestingPrimaryWallet,
  savedPersonID,
}: {
  requestingPrimaryWallet: string
  savedPersonID: string
}): Promise<SavedPersonResponse | null> {
  try {
    const savedPersonDoc = await SavedPersonModel
      .findOne({
        _id: savedPersonID && savedPersonID !== '' ? savedPersonID : null,
        // you gotta be savedBy to fetch SavedPerson
        savedBy: requestingPrimaryWallet,
      })

    const primaryWalletSavedUserDoc = await UserV2Model.findOne({ primaryWallet: savedPersonDoc?.primaryWalletSaved })

    return savedPersonDoc ? mapSavedPersonResponse(savedPersonDoc, primaryWalletSavedUserDoc) : null
  } catch (error) {
    console.error('error occurred while fetching SavedPerson from DB', error)
    throw new Error('failed to fetch SavedPerson from DB')
  }
}

export async function fetchAllSavedPersonFromDB(
  options: SavedPersonQueryOptions,
  savedBy: string,
): Promise<SavedPersonResponse[]> {
  try {
    const { skip, limit, orderBy, search } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<SavedPersonDocument>[] = []

    if (savedBy) {
      filterOptions.push({
        $or: [
          { savedBy: { $regex: new RegExp("^" + savedBy + "$", 'iu') } },
        ],
      })
    }
    // if (additionalMessage) {
    //   filterOptions.push({
    //     $or: [
    //       { additionalMessage: { $regex: new RegExp(additionalMessage, 'iu') } },
    //     ],
    //   })
    // }
    if (search) {
      filterOptions.push({
        $or: [
          { primaryWalletSaved: { $regex: new RegExp(search, 'iu') } },
          { chosenName: { $regex: new RegExp(search, 'iu') } },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const savedPersonDocs = await SavedPersonModel.aggregate([
      { $match: filterQuery },
      { $lookup: {
          from: 'userv2', // The name of the UserV2 collection
          localField: 'primaryWalletSaved', // Field from SavedPerson
          foreignField: 'primaryWallet', // Field from UserV2 to match against
          as: 'primaryWalletSavedUser' // Output array field
        }
      },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limit }
    ])
  
    return savedPersonDocs.map(doc => {
      const primaryWalletSavedUser = doc.primaryWalletSavedUser[0] // Get the first user from the array
      return mapSavedPersonResponse(doc, primaryWalletSavedUser) as SavedPersonResponse
    })
  } catch (error) {
    console.error('error occurred while fetching all SavedPerson from DB', error)
    throw new Error('failed to fetch all SavedPerson from DB')
  }
}

export async function updateSavedPersonInDB({
  requestingPrimaryWallet,
  savedPersonID,
  updatedData,
}: {
  requestingPrimaryWallet: string
  savedPersonID: string
  updatedData: Partial<SavedPersonRequest>
}): Promise<SavedPersonResponse | null> {
  try {
    const updatedSavedPersonDoc = await SavedPersonModel.findOneAndUpdate(
      {
        _id: savedPersonID && savedPersonID !== '' ? savedPersonID : null,
        // you gotta be savedBy to update SavedPerson
        savedBy: requestingPrimaryWallet,
      },
      updatedData,
      { new: true }
    )
    const primaryWalletSavedUserDoc = await UserV2Model.findOne({ primaryWallet: updatedSavedPersonDoc?.primaryWalletSaved })
    return updatedSavedPersonDoc ? mapSavedPersonResponse(updatedSavedPersonDoc, primaryWalletSavedUserDoc) : null
  } catch (error) {
    console.error('error occurred while updating SavedPerson in DB', error)
    throw new Error('failed to update SavedPerson in DB')
  }
}

export async function deleteSavedPersonInDB(savedPersonID: string, requestingPrimaryWallet: string): Promise<void> {
  try {
    const savedPersonDoc = await SavedPersonModel.findOne({ _id: savedPersonID, savedBy: requestingPrimaryWallet })
    if (!savedPersonDoc) {
      throw new Error('unauthorized or SavedPerson not found')
    }
    await SavedPersonModel.deleteOne({ _id: savedPersonID })
  } catch (error) {
    console.error('error occurred while deleting SavedPerson from DB', error)
    throw new Error('failed to delete SavedPerson from DB')
  }
}
