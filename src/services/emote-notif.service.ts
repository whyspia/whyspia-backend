import mongoose from 'mongoose'
import type { FilterQuery } from 'mongoose'

import { EmoteNotifModel } from '../models/emote-notif.model'
import type { EmoteNotifDocument } from '../models/emote-notif.model'
import type { EmoteNotifQueryOptions, EmoteNotifRequest, EmoteNotifResponse, EmoteNotifSingleResponse } from '../types/emote-notif.types'
import { InternalServerError } from './errors'
import { mapEmoteNotifResponse } from '../util/emoteNotifUtil'
import escapeStringRegexp from 'escape-string-regexp'
import { createSymbolInDB, fetchAllSymbolsFromDB } from './symbol.service'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

export async function createEmoteNotifInDB(emoteNotifData: Partial<EmoteNotifRequest>): Promise<EmoteNotifSingleResponse | null> {
  try {
    const emoteNotifBuildData = {
      emoteID: emoteNotifData.emoteID as string,
      receiverSymbol: emoteNotifData.receiverSymbol as string,
      hasReadCasually: false as boolean,
      hasReadDirectly: false as boolean,
    }
    const emoteDoc = EmoteNotifModel.build(emoteNotifBuildData)
    const createdEmoteNotif = await EmoteNotifModel.create(emoteDoc)
    return mapEmoteNotifResponse(createdEmoteNotif)
  } catch (error) {
    console.error('Error occurred while creating emote notif in DB', error)
    throw new InternalServerError('Failed to create emote notif in DB')
  }

}

export async function fetchAllEmoteNotifsFromDB(
  options: EmoteNotifQueryOptions,
  decodedAccount: DECODED_ACCOUNT
): Promise<EmoteNotifResponse> {
  try {

    const { skip, limit, orderBy, } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<EmoteNotifDocument>[] = []

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const [emoteNotifDocs] = await EmoteNotifModel.aggregate([
      {
        $addFields: {
          convertedEmoteID: { $toObjectId: "$emoteID" } // Convert emoteID from string to ObjectId
        }
      },
      {
        $lookup: {
          from: 'emotes', // the collection to join
          localField: 'convertedEmoteID', // field from the input documents
          foreignField: '_id', // field from the documents of the "from" collection
          as: 'emoteData' // output array field
        }
      },
      {
        $unwind: '$emoteData' // makes emoteData not an array with 1 element - instead returns that 1 element
      },
      {
        // TODO: check this still works
        $match: {
          receiverSymbol: decodedAccount.twitterUsername, // this makes sure that YOU only get YOUR notifications
        }
      },
      {
        $facet: {
          documents: [
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: limit }
          ],
          hasReadCasuallyFalseCount: [
            { $match: { hasReadCasually: false } },
            { $count: "count" }
          ],
          hasReadDirectlyFalseCount: [
            { $match: { hasReadDirectly: false } },
            { $count: "count" }
          ]
        }
      }
    ]) as any
    // .sort(sortOptions)
    // .skip(skip)
    // .limit(limit)

    const emoteNotifs = emoteNotifDocs?.documents?.map((doc: EmoteNotifDocument) => mapEmoteNotifResponse(doc) as EmoteNotifSingleResponse)
    const hasReadCasuallyFalseCount = emoteNotifDocs.hasReadCasuallyFalseCount.length > 0 ? emoteNotifDocs.hasReadCasuallyFalseCount[0].count : 0;
    const hasReadDirectlyFalseCount = emoteNotifDocs.hasReadDirectlyFalseCount.length > 0 ? emoteNotifDocs.hasReadDirectlyFalseCount[0].count : 0;

    return { emoteNotifs, hasReadCasuallyFalseCount, hasReadDirectlyFalseCount  }
  } catch (error) {
    console.error('Error occurred while fetching all emote notifs from DB', error)
    throw new InternalServerError('Failed to fetch all emote notifs from DB')
  }
}

export async function updateEmoteNotifsInDB(
  emoteNotifIDs: string[],
  isCasualRead: boolean,
  isMarkingUnread: boolean,
  decodedAccount: DECODED_ACCOUNT
): Promise<Partial<EmoteNotifResponse>> {
  try {
    let setterObj = {}

    if (isCasualRead) {
      setterObj = { $set: { hasReadCasually: !isMarkingUnread } }
    } else {
      if (isMarkingUnread) {
        // made decision to not change casual read here. Only directRead. Maybe user wants to mark directly unread, but not change casual
        setterObj = { $set: { hasReadDirectly: false } }
      } else {
        setterObj = { $set: { hasReadCasually: true, hasReadDirectly: true } }
      }
    }
    // const updatedEmoteDoc = await EmoteNotifModel.findByIdAndUpdate(EmoteId, updatedData, { new: true })
    // return updatedEmoteDoc ? updatedEmoteDoc.toObject() : null
    const updatePromises = emoteNotifIDs.map(emoteNotifID =>
      EmoteNotifModel.findByIdAndUpdate(
        emoteNotifID,
        setterObj,
        { new: true }
      ).exec()
    )

    const updatedEmoteNotifDocs = await Promise.all(updatePromises)

    const [emoteNotifDocs] = await EmoteNotifModel.aggregate([
      {
        $match: {
          receiverSymbol: decodedAccount.twitterUsername, // this makes sure that YOU only get YOUR notifications
        }
      },
      {
        $facet: {
          hasReadCasuallyFalseCount: [
            { $match: { hasReadCasually: false } },
            { $count: "count" }
          ],
          hasReadDirectlyFalseCount: [
            { $match: { hasReadDirectly: false } },
            { $count: "count" }
          ]
        }
      }
    ])

    // const emoteNotifs = emoteNotifDocs?.documents?.map((doc: EmoteNotifDocument) => mapEmoteNotifResponse(doc) as EmoteNotifSingleResponse)
    const hasReadCasuallyFalseCount = emoteNotifDocs.hasReadCasuallyFalseCount.length > 0 ? emoteNotifDocs.hasReadCasuallyFalseCount[0].count : 0;
    const hasReadDirectlyFalseCount = emoteNotifDocs.hasReadDirectlyFalseCount.length > 0 ? emoteNotifDocs.hasReadDirectlyFalseCount[0].count : 0;

    // return updatedEmoteNotifDocs.map((doc: any) => mapEmoteNotifResponse(doc))
    return { hasReadCasuallyFalseCount, hasReadDirectlyFalseCount  }
  } catch (error) {
    console.error('Error occurred while updating EmoteNotifs in DB', error)
    throw new InternalServerError('Failed to update EmoteNotifs in DB')
  }
}

export async function fetchAndUpdateAllEmoteNotifsInDB(
  options: EmoteNotifQueryOptions,
  decodedAccount: DECODED_ACCOUNT
): Promise<Partial<EmoteNotifResponse>> {
  try {
    // Fetching part similar to fetchAllEmoteNotifsFromDB
    const { skip, limit, orderBy } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    const filterOptions: FilterQuery<EmoteNotifDocument>[] = []

    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const [emoteNotifDocs] = await EmoteNotifModel.aggregate([
      {
        $addFields: {
          convertedEmoteID: { $toObjectId: "$emoteID" }
        }
      },
      {
        $lookup: {
          from: 'emotes',
          localField: 'convertedEmoteID',
          foreignField: '_id',
          as: 'emoteData'
        }
      },
      {
        $unwind: '$emoteData'
      },
      {
        $match: {
          receiverSymbol: decodedAccount.twitterUsername,
        }
      },
      {
        $facet: {
          documents: [
            { $sort: sortOptions },
            { $skip: skip },
            { $limit: limit }
          ],
          hasReadCasuallyFalseCount: [
            { $match: { hasReadCasually: false } },
            { $count: "count" }
          ],
          hasReadDirectlyFalseCount: [
            { $match: { hasReadDirectly: false } },
            { $count: "count" }
          ]
        }
      }
    ]) as any

    // Update part similar to updateEmoteNotifsInDB
    const emoteNotifIDs = emoteNotifDocs.documents.map((doc: any) => doc._id)
    const setterObj = { $set: { hasReadCasually: true } }

    // TODO: maybe make so only updates notifs with hasReadCasually is false - i think currently it just does all in the paginated list fetched

    const updatePromises = emoteNotifIDs.map((emoteNotifID: any) =>
      EmoteNotifModel.findByIdAndUpdate(
        emoteNotifID,
        setterObj,
        { new: true }
      ).exec()
    )

    await Promise.all(updatePromises)

    // Re-fetching the counts after update. Since we only update paginated, the casual counts arent necessarily gonna be 0
    const [updatedEmoteNotifDocs] = await EmoteNotifModel.aggregate([
      {
        $match: {
          receiverSymbol: decodedAccount.twitterUsername,
        }
      },
      {
        $facet: {
          hasReadCasuallyFalseCount: [
            { $match: { hasReadCasually: false } },
            { $count: "count" }
          ],
          hasReadDirectlyFalseCount: [
            { $match: { hasReadDirectly: false } },
            { $count: "count" }
          ]
        }
      }
    ])

    const hasReadCasuallyFalseCount = updatedEmoteNotifDocs.hasReadCasuallyFalseCount.length > 0 ? updatedEmoteNotifDocs.hasReadCasuallyFalseCount[0].count : 0
    const hasReadDirectlyFalseCount = updatedEmoteNotifDocs.hasReadDirectlyFalseCount.length > 0 ? updatedEmoteNotifDocs.hasReadDirectlyFalseCount[0].count : 0

    const emoteNotifs = emoteNotifDocs?.documents?.map((doc: EmoteNotifDocument) => mapEmoteNotifResponse(doc) as EmoteNotifSingleResponse)

    return { emoteNotifs, hasReadCasuallyFalseCount, hasReadDirectlyFalseCount }
  } catch (error) {
    console.error('Error occurred while fetching and updating EmoteNotifs in DB', error)
    throw new InternalServerError('Failed to fetch and update EmoteNotifs in DB')
  }
}

// export async function deleteEmoteNotifInDB(emoteNotifId: string): Promise<void> {
//   try {
//     await EmoteNotifModel.findByIdAndDelete(emoteNotifId)
//   } catch (error) {
//     console.error('Error occurred while deleting emote notif from DB', error)
//     throw new InternalServerError('Failed to delete emote notif from DB')
//   }
// }
