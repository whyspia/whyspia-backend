import type { FilterQuery } from 'mongoose'

import { TAUModel } from '../models/tau.model'
import type { TAUDocument } from '../models/tau.model'
import type { TAUQueryOptions, TAURequest, TAUResponse } from '../types/tau.types'
import { InternalServerError } from './errors'
import { mapTAUResponse } from '../util/tauUtil'
import { createEmoteNotifInDB } from './emote-notif.service'
import { NOTIF_TYPE } from '../models/emote-notif.model'
import { UserV2Model } from '../models/user-v2.model'

export async function createTAUInDB(tauData: Partial<TAURequest>): Promise<TAUResponse | null> {
  try {

    const tauBuildData = {
      senderPrimaryWallet: tauData.senderPrimaryWallet as string,
      receiverPrimaryWallet: tauData.receiverPrimaryWallet as string,
      additionalMessage: tauData.additionalMessage as string,
    }
    const tauDoc = TAUModel.build(tauBuildData)
    const createdTAU = await TAUModel.create(tauDoc)

    const senderUserDoc = await UserV2Model.findOne({ primaryWallet: createdTAU?.senderPrimaryWallet })
    const receiverUserDoc = await UserV2Model.findOne({ primaryWallet: createdTAU?.receiverPrimaryWallet })

    await createEmoteNotifInDB({ notifType: NOTIF_TYPE.TAU_SENT, notifDataID: createdTAU._id.toString(), receiverSymbol: tauData.receiverPrimaryWallet, initialNotifData: mapTAUResponse(createdTAU, senderUserDoc, receiverUserDoc) })
    
    return createdTAU ? mapTAUResponse(createdTAU, senderUserDoc, receiverUserDoc) : null
  } catch (error) {
    console.error('error occurred while creating tau in DB', error)
    throw new InternalServerError('failed to create tau in DB')
  }
}

export async function fetchTAUFromDB({
  tauID,
  requestingPrimaryWallet,
  mustBeSender = false,
}: {
  tauID: string
  requestingPrimaryWallet: string
  mustBeSender?: boolean
}): Promise<TAUResponse | null> {
  try {
    const tauDoc = await TAUModel
      .findOne({
        _id: tauID && tauID !== '' ? tauID : null,
        // this makes sure that YOU (sender or receiver) only get YOUR data. only checks sender if mustBeSender is true (mainly so receivers cant delete a TAU from sender)
        ...(mustBeSender ? { senderPrimaryWallet: requestingPrimaryWallet } : {
          $or: [
            { senderPrimaryWallet: requestingPrimaryWallet },
            { receiverPrimaryWallet: requestingPrimaryWallet }
          ]
        })
      })
    const senderUserDoc = await UserV2Model.findOne({ primaryWallet: tauDoc?.senderPrimaryWallet })
    const receiverUserDoc = await UserV2Model.findOne({ primaryWallet: tauDoc?.receiverPrimaryWallet })
    return tauDoc ? mapTAUResponse(tauDoc, senderUserDoc, receiverUserDoc) : null
  } catch (error) {
    console.error('error occurred while fetching TAU from DB', error)
    throw new InternalServerError('failed to fetch TAU from DB')
  }
}

export async function fetchAllTAUsFromDB(
  options: TAUQueryOptions
): Promise<TAUResponse[]> {
  try {

    const { skip, limit, orderBy, senderPrimaryWallet, receiverPrimaryWallet, additionalMessage } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<TAUDocument>[] = []

    if (senderPrimaryWallet) {
      filterOptions.push({
        $or: [
          { senderPrimaryWallet: { $regex: new RegExp("^" + senderPrimaryWallet + "$", 'iu') } },
        ],
      })
    }
    if (receiverPrimaryWallet) {
      filterOptions.push({
        $or: [
          { receiverPrimaryWallet: { $regex: new RegExp("^" + receiverPrimaryWallet + "$", 'iu') } },
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

    // const tauDocs: TAUDocument[] = await TAUModel
    //   .find(filterQuery)
    //   .sort(sortOptions)
    //   .skip(skip)
    //   .limit(limit)

    const tauDocs = await TAUModel.aggregate([
      { $match: filterQuery },
      { $lookup: {
          from: 'userv2', // The name of the UserV2 collection
          localField: 'senderPrimaryWallet', // Field from TAU
          foreignField: 'primaryWallet', // Field from UserV2 to match against
          as: 'senderUser' // Output array field
        }
      },
      { $lookup: {
          from: 'userv2', // The name of the UserV2 collection
          localField: 'receiverPrimaryWallet', // Field from TAU
          foreignField: 'primaryWallet', // Field from UserV2 to match against
          as: 'receiverUser' // Output array field
        }
      },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limit }
    ])
  
    return tauDocs.map(doc => {
      const senderUser = doc.senderUser[0] // Get the first user from the array
      const receiverUser = doc.receiverUser[0] // Get the first user from the array
      return mapTAUResponse(doc, senderUser, receiverUser) as TAUResponse
    })
  } catch (error) {
    console.error('error occurred while fetching all taus from DB', error)
    throw new InternalServerError('failed to fetch all taus from DB')
  }
}

export async function deleteTAUInDB(tauID: string, senderPrimaryWallet: string): Promise<void> {
  try {
    const tau = await TAUModel.findOneAndDelete({ _id: tauID, senderPrimaryWallet })
    if (!tau) {
      throw new Error('TAU not found or you are not authorized to delete it')
    }
  } catch (error) {
    console.error('error occurred while deleting tau from DB', error)
    throw new InternalServerError('failed to delete tau from DB')
  }
}
