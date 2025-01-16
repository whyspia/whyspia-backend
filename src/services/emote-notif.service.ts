import mongoose from 'mongoose'
import type { FilterQuery } from 'mongoose'

import { EmoteNotifModel } from '../models/emote-notif.model'
import type { EmoteNotifDocument } from '../models/emote-notif.model'
import type { EmoteNotifQueryOptions, EmoteNotifRequest, EmoteNotifResponse, EmoteNotifSingleResponse } from '../types/emote-notif.types'
import { InternalServerError } from './errors'
import { mapEmoteNotifResponse, mapNotifData } from '../util/emoteNotifUtil'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'
import { getContextOfEmote, getContextOfNotif } from './context.service'
import { mapEmoteResponse } from '../util/emoteUtil'
import { NOTIF_TYPE } from '../models/emote-notif.model'
import { getMappingListOfWalletToUserToken } from './user-v2.service'

export async function createEmoteNotifInDB(emoteNotifData: Partial<EmoteNotifRequest>): Promise<EmoteNotifSingleResponse | null> {
  try {
    const emoteNotifBuildData = {
      notifDataID: emoteNotifData.notifDataID as string,
      notifType: emoteNotifData.notifType as NOTIF_TYPE,
      receiverSymbol: emoteNotifData.receiverSymbol as string,
      hasReadCasually: false as boolean,
      hasReadDirectly: false as boolean,
      initialNotifData: emoteNotifData.initialNotifData,
    }
    const emoteDoc = EmoteNotifModel.build(emoteNotifBuildData)
    const createdEmoteNotif = await EmoteNotifModel.create(emoteDoc)
    return mapEmoteNotifResponse(createdEmoteNotif, null)
  } catch (error) {
    console.error('error occurred while creating emote notif in DB', error)
    throw new InternalServerError('failed to create emote notif in DB')
  }

}

export async function fetchAllEmoteNotifsFromDB(
  options: EmoteNotifQueryOptions,
  decodedAccount: DECODED_ACCOUNT
): Promise<EmoteNotifResponse> {
  try {

    const { skip, limit, orderBy, notifType } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[`${orderBy}`] = orderDirection
    sortOptions['_id'] = 1

    // Filter Options
    const filterOptions: FilterQuery<EmoteNotifDocument>[] = []

    if (notifType) {
      filterOptions.push({
        $or: [
          { notifType: { $regex: new RegExp("^" + notifType + "$", 'iu') } },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }
    
    const [emoteNotifDocs] = await EmoteNotifModel.aggregate([
      { $match: filterQuery },
      {
        $match: {
          "receiverSymbol": decodedAccount?.primaryWallet  // this makes sure that YOU only get YOUR notifications
        }
      },
      { $lookup: {
          from: 'userv2', // The name of the UserV2 collection
          localField: 'receiverSymbol', // Field from EmoteNotif
          foreignField: 'primaryWallet', // Field from UserV2 to match against
          as: 'receiverSymbolUser' // Output array field
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
            { $match: { 'hasReadCasually': false } },
            { $count: "count" }
          ],
          hasReadDirectlyFalseCount: [
            { $match: { 'hasReadDirectly': false } },
            { $count: "count" }
          ]
        }
      }
    ]) as any

    // loop through emoteNotifs and add a new field for each item
    // typically context will be calculated with the notifData...but here notifData is calced in DB query...so cant really do dat
    const emoteNotifsWithContext = await Promise.all(emoteNotifDocs?.documents?.map(async (emoteNotif: any) => {
      const emoteResponse = emoteNotif.notifType === NOTIF_TYPE.EMOTE ? mapEmoteResponse(emoteNotif.initialNotifData, emoteNotif.initialNotifData?.senderUser, emoteNotif.initialNotifData?.receiverUsers) : null
      const context = await getContextOfNotif(emoteResponse, emoteNotif.notifType)
      let notifData = await mapNotifData(emoteNotif.initialNotifData, emoteNotif.notifType, decodedAccount?.primaryWallet)
      return { ...emoteNotif, notifData: { ...notifData, context }, context }
    }))

    const fieldMapping = {
      receiverSymbol: 'receiverSymbolUser'
    }
    const userWithDisplayNameMap = await getMappingListOfWalletToUserToken(
      emoteNotifsWithContext, 
      fieldMapping,
      decodedAccount?.primaryWallet
    )

    // const emoteNotifs = emoteNotifsWithContext.map((doc: EmoteNotifDocument) => mapEmoteNotifResponse(doc) as EmoteNotifSingleResponse)
    const emoteNotifs = emoteNotifsWithContext.map(doc => {
      const receiverSymbolUser = userWithDisplayNameMap[doc.receiverSymbol]
      return mapEmoteNotifResponse(doc, receiverSymbolUser) as EmoteNotifSingleResponse
    })
    const hasReadCasuallyFalseCount = emoteNotifDocs.hasReadCasuallyFalseCount.length > 0 ? emoteNotifDocs.hasReadCasuallyFalseCount[0].count : 0;
    const hasReadDirectlyFalseCount = emoteNotifDocs.hasReadDirectlyFalseCount.length > 0 ? emoteNotifDocs.hasReadDirectlyFalseCount[0].count : 0;

    return { emoteNotifs, hasReadCasuallyFalseCount, hasReadDirectlyFalseCount  }
  } catch (error) {
    console.error('error occurred while fetching all emote notifs from DB', error)
    throw new InternalServerError('failed to fetch all emote notifs from DB')
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
          receiverSymbol: decodedAccount?.primaryWallet, // this makes sure that YOU only get YOUR notifications
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
    console.error('error occurred while updating EmoteNotifs in DB', error)
    throw new InternalServerError('failed to update EmoteNotifs in DB')
  }
}

export async function fetchAndUpdateAllEmoteNotifsInDB(
  options: EmoteNotifQueryOptions,
  decodedAccount: DECODED_ACCOUNT
): Promise<Partial<EmoteNotifResponse>> {
  try {
    // Fetching part similar to fetchAllEmoteNotifsFromDB
    const { skip, limit, orderBy, notifType } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    const sortOptions: any = {}
    sortOptions[`${orderBy}`] = orderDirection
    sortOptions['_id'] = 1

    const filterOptions: FilterQuery<EmoteNotifDocument>[] = []

    if (notifType) {
      filterOptions.push({
        $or: [
          { notifType: { $regex: new RegExp("^" + notifType + "$", 'iu') } },
        ],
      })
    }

    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const [emoteNotifDocs] = await EmoteNotifModel.aggregate([
      { $match: filterQuery },
      {
        $match: {
          "receiverSymbol": decodedAccount?.primaryWallet  // this makes sure that YOU only get YOUR notifications
        }
      },
      { $lookup: {
          from: 'userv2', // The name of the UserV2 collection
          localField: 'receiverSymbol', // Field from EmoteNotif
          foreignField: 'primaryWallet', // Field from UserV2 to match against
          as: 'receiverSymbolUser' // Output array field
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
            { $match: { 'hasReadCasually': false } },
            { $count: "count" }
          ],
          hasReadDirectlyFalseCount: [
            { $match: { 'hasReadDirectly': false } },
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
          receiverSymbol: decodedAccount?.primaryWallet,
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

    // loop through emoteNotifs and add a new field for each item
    // typically context will be calculated with the notifData...but here notifData is calced in DB query...so cant really do dat
    const emoteNotifsWithContext = await Promise.all(emoteNotifDocs?.documents?.map(async (emoteNotif: any) => {
      const emoteResponse = emoteNotif.notifType === NOTIF_TYPE.EMOTE ? mapEmoteResponse(emoteNotif.initialNotifData, emoteNotif.initialNotifData?.senderUser, emoteNotif.initialNotifData?.receiverUsers) : null
      const context = await getContextOfNotif(emoteResponse, emoteNotif.notifType)
      let notifData = emoteNotif.initialNotifData
      return { ...emoteNotif, notifData: { ...notifData }, context }
    }))

    const fieldMapping = {
      receiverSymbol: 'receiverSymbolUser'
    }
    const userWithDisplayNameMap = await getMappingListOfWalletToUserToken(
      emoteNotifsWithContext, 
      fieldMapping,
      decodedAccount?.primaryWallet
    )

    // const emoteNotifs = emoteNotifsWithContext?.map((doc: EmoteNotifDocument) => mapEmoteNotifResponse(doc) as EmoteNotifSingleResponse)
    const emoteNotifs = emoteNotifsWithContext.map(doc => {
      const receiverSymbolUser = userWithDisplayNameMap[doc.receiverSymbol]
      return mapEmoteNotifResponse(doc, receiverSymbolUser) as EmoteNotifSingleResponse
    })

    return { emoteNotifs, hasReadCasuallyFalseCount, hasReadDirectlyFalseCount }
  } catch (error) {
    console.error('error occurred while fetching and updating EmoteNotifs in DB', error)
    throw new InternalServerError('failed to fetch and update EmoteNotifs in DB')
  }
}

// export async function deleteEmoteNotifInDB(emoteNotifId: string): Promise<void> {
//   try {
//     await EmoteNotifModel.findByIdAndDelete(emoteNotifId)
//   } catch (error) {
//     console.error('error occurred while deleting emote notif from DB', error)
//     throw new InternalServerError('failed to delete emote notif from DB')
//   }
// }
