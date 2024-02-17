import mongoose from 'mongoose'
import type { FilterQuery } from 'mongoose'

import { EmoteNotifModel } from '../models/emote-notif.model'
import type { EmoteNotifDocument } from '../models/emote-notif.model'
import type { EmoteNotifQueryOptions, EmoteNotifRequest, EmoteNotifResponse } from '../types/emote-notif.types'
import { InternalServerError } from './errors'
import { mapEmoteNotifResponse } from '../util/emoteNotifUtil'
import escapeStringRegexp from 'escape-string-regexp'
import { createSymbolInDB, fetchAllSymbolsFromDB } from './symbol.service'

export async function createEmoteNotifInDB(emoteNotifData: Partial<EmoteNotifRequest>): Promise<EmoteNotifResponse | null> {
  try {
    const emoteNotifBuildData = {
      emoteID: emoteNotifData.emoteID as string,
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
  options: EmoteNotifQueryOptions
): Promise<EmoteNotifResponse[]> {
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

    const emoteNotifDocs: EmoteNotifDocument[] = await EmoteNotifModel
      .find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    return emoteNotifDocs.map((doc) => mapEmoteNotifResponse(doc) as EmoteNotifResponse)
  } catch (error) {
    console.error('Error occurred while fetching all emote notifs from DB', error)
    throw new InternalServerError('Failed to fetch all emote notifs from DB')
  }
}

export async function updateEmoteNotifsInDB(emoteNotifIDs: string[], isCasualRead: boolean): Promise<EmoteNotifResponse[]> {
  try {
    // const updatedEmoteDoc = await EmoteNotifModel.findByIdAndUpdate(EmoteId, updatedData, { new: true })
    // return updatedEmoteDoc ? updatedEmoteDoc.toObject() : null
    const updatePromises = emoteNotifIDs.map(emoteNotifID =>
      EmoteNotifModel.findByIdAndUpdate(
        emoteNotifID,
        isCasualRead ? { $set: { hasReadCasually: true } } : { $set: { hasReadCasually: true, hasReadDirectly: true } },
        { new: true }
      ).exec()
    )

    const updatedEmoteNotifDocs = await Promise.all(updatePromises)
    return updatedEmoteNotifDocs.map(doc => mapEmoteNotifResponse(doc as EmoteNotifDocument))
  } catch (error) {
    console.error('Error occurred while updating EmoteNotifs in DB', error)
    throw new InternalServerError('Failed to update EmoteNotifs in DB')
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
