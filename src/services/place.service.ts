import { FilterQuery } from 'mongoose'
import { PlaceQueryOptions, PlaceRequest, PlaceResponse } from '../types/place.types'
import { PlaceDocument, PlaceModel } from '../models/place.model'
import { InternalServerError } from './errors'
import { mapPlaceResponse } from '../util/placeUtil'

export const createPlaceInDB = async (placeData: Partial<PlaceRequest>): Promise<PlaceResponse | null> => {
  try {
    const inputVisitCount = placeData?.visitCount // usually just 1 if passed in as input
    const placeBuildData = {
      placeName: placeData.placeName as string,
      visitCount: inputVisitCount ?? 0,
    }
    const placeDoc = PlaceModel.build(placeBuildData)
    const createdPlace = await PlaceModel.create(placeDoc)

    // const senderUserDoc = await UserV2Model.findOne({ primaryWallet: createdPlace?.senderPrimaryWallet })
    // const senderUserWithDisplayName = await getUserTokenWithDisplayName(senderUserDoc, placeData.senderPrimaryWallet as string)

    return createdPlace ? mapPlaceResponse(createdPlace) : null
  } catch (error) {
    console.error('error occurred while creating Place in DB', error)
    throw new Error('failed to create Place in DB')
  }
}

export const fetchPlaceFromDB = async ({
  placeID,
  placeName,
}: {
  placeID?: string
  placeName?: string
}): Promise<PlaceResponse | null> => {
  try {
    const placeDoc = await PlaceModel.findOne({
      $or: [
        { _id: placeID && placeID !== '' ? placeID : null, },
        { placeName: { $regex: new RegExp("^" + placeName + "$", 'iu') } },
        // {
        //   $and: [
        //     { eventName: { $regex: new RegExp("^" + eventName + "$", 'iu') } },
        //     { eventCreator: { $regex: new RegExp("^" + eventCreator + "$", 'iu') } }
        //   ]
        // }
      ],
    })

    // const senderUserDoc = await UserV2Model.findOne({ primaryWallet: placeDoc?.senderPrimaryWallet })
    // const senderUserWithDisplayName = await getUserTokenWithDisplayName(senderUserDoc, requestingPrimaryWallet)

    return placeDoc ? mapPlaceResponse(placeDoc as any) : null
  } catch (error) {
    console.error('error occurred while fetching Place from DB', error)
    throw new Error('failed to fetch Place from DB')
  }
}

export async function fetchAllPlacesFromDB(options: PlaceQueryOptions): Promise<PlaceResponse[]> {
  try {
    const { skip, limit, orderBy, search, requestingPrimaryWallet } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<PlaceDocument>[] = []

    if (search) {
      filterOptions.push({
        $or: [
          { placeName: { $regex: new RegExp(search, 'iu') } },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const placeDocs = await PlaceModel.aggregate([
      { $match: filterQuery },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limit }
    ])
  
    return placeDocs.map(doc => {
      // const senderUser = userWithDisplayNameMap[doc.senderPrimaryWallet]
      return mapPlaceResponse(doc) as PlaceResponse
    })
  } catch (error) {
    console.error('error occurred while fetching all Place from DB', error)
    throw new Error('failed to fetch all Place from DB')
  }
}

// right now ALL this does is increament visitCount by 1
export async function updatePlaceInDB(
  placeID?: string,
  placeName?: string,
  requestingPrimaryWallet?: string,
): Promise<PlaceResponse | null> {
  try {
    const updatedPlaceDoc = await PlaceModel.findOneAndUpdate(
      {
        $or: [
          { _id: placeID && placeID !== '' ? placeID : null },
          { placeName: { $regex: new RegExp("^" + placeName + "$", 'iu') } },
        ],
      },
      { $inc: { visitCount: 1 } },
      { new: true }
    )

    if (!updatedPlaceDoc) {
      throw new Error('existing Place record to update not found')
    }

    return mapPlaceResponse(updatedPlaceDoc as any)
  } catch (error) {
    console.error('error occurred while updating Place record in DB', error)
    throw new InternalServerError('failed to update Place record in DB')
  }
}

// export const deletePlaceInDB = async (placeId: string): Promise<IPlace | null> => {
//   try {
//     const place = await Place.findByIdAndDelete(placeId)
//     return place
//   } catch (error) {
//     console.error('error occurred while deleting Place from DB', error)
//     throw new Error('failed to delete Place from DB')
//   }
// } 