import mongoose from 'mongoose'
import type { FilterQuery } from 'mongoose'

import { TAUModel } from '../models/tau.model'
import type { TAUDocument } from '../models/tau.model'
import type { TAUQueryOptions, TAURequest, TAUResponse } from '../types/tau.types'
import { InternalServerError } from './errors'
import { mapTAUResponse } from '../util/tauUtil'

export async function createTAUInDB(tauData: Partial<TAURequest>): Promise<TAUResponse | null> {
  try {

    const tauBuildData = {
      senderSymbol: tauData.senderSymbol as string,
      receiverSymbol: tauData.receiverSymbol as string,
      additionalMessage: tauData.additionalMessage as string,
    }
    const tauDoc = TAUModel.build(tauBuildData)
    const createdTAU = await TAUModel.create(tauDoc)
    return mapTAUResponse(createdTAU)
  } catch (error) {
    console.error('error occurred while creating tau in DB', error)
    throw new InternalServerError('failed to create tau in DB')
  }
}

export async function fetchTAUFromDB({
  tauID,
  senderSymbol,
}: {
  tauID: string
  senderSymbol: string
}): Promise<TAUResponse | null> {
  try {
    const tauDoc = await TAUModel.findOne({
      _id: tauID && tauID !== '' ? tauID : null,
      senderSymbol, // this makes sure that YOU only get YOUR data
    })
    return tauDoc ? mapTAUResponse(tauDoc as any) : null
  } catch (error) {
    console.error('error occurred while fetching TAU from DB', error)
    throw new InternalServerError('failed to fetch TAU from DB')
  }
}

export async function fetchAllTAUsFromDB(
  options: TAUQueryOptions
): Promise<TAUResponse[]> {
  try {

    const { skip, limit, orderBy, senderSymbol, receiverSymbol, additionalMessage } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<TAUDocument>[] = []

    if (senderSymbol) {
      filterOptions.push({
        $or: [
          { senderSymbol: { $regex: new RegExp("^" + senderSymbol + "$", 'iu') } },
        ],
      })
    }
    if (receiverSymbol) {
      filterOptions.push({
        $or: [
          { receiverSymbol: { $regex: new RegExp("^" + receiverSymbol + "$", 'iu') } },
        ],
      })
    }
    if (additionalMessage) {
      filterOptions.push({
        $or: [
          { additionalMessage: { $regex: new RegExp(additionalMessage, 'iu') } },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const tauDocs: TAUDocument[] = await TAUModel
      .find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    return tauDocs.map((doc) => mapTAUResponse(doc) as TAUResponse)
  } catch (error) {
    console.error('error occurred while fetching all taus from DB', error)
    throw new InternalServerError('failed to fetch all taus from DB')
  }
}

export async function deleteTAUInDB(tauID: string, senderSymbol: string): Promise<void> {
  try {
    const tau = await TAUModel.findOneAndDelete({ _id: tauID, senderSymbol })
    if (!tau) {
      throw new Error('TAU not found or you are not authorized to delete it')
    }
  } catch (error) {
    console.error('Error occurred while deleting tau from DB', error)
    throw new InternalServerError('Failed to delete tau from DB')
  }
}
