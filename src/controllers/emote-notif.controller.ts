import type { Request, Response } from 'express'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

import { handleError, handleSuccess } from '../lib/base'
import {
  createEmoteNotifInDB,
  fetchAllEmoteNotifsFromDB,
  fetchAndUpdateAllEmoteNotifsInDB,
  updateEmoteNotifsInDB,
  // deleteEmoteNotifInDB,
} from '../services/emote-notif.service'
import type { EmoteNotifQueryOptions, EmoteNotifResponse } from '../types/emote-notif.types'
import { NOTIF_TYPE } from '../models/emote-notif.model'

export async function createEmoteNotif(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const requestData = {
      notifDataID: reqBody.notifDataID,
      notifType: reqBody.notifType,
      initialNotifData: reqBody.initialNotifData,
    }
    const emoteNotif = await createEmoteNotifInDB(requestData)
    return handleSuccess(res, { emoteNotif })
  } catch (error) {
    console.error('Error occurred while creating emote notif', error)
    return handleError(res, error, 'Unable to create emote notif')
  }
}

export async function fetchAllEmoteNotifs(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof EmoteNotifResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const notifType = req.query.notifType as NOTIF_TYPE ?? null

    const options: EmoteNotifQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      notifType
    }

    const { emoteNotifs, hasReadCasuallyFalseCount, hasReadDirectlyFalseCount } = await fetchAllEmoteNotifsFromDB(options, decodedAccount)
    return handleSuccess(res, { emoteNotifs, hasReadCasuallyFalseCount, hasReadDirectlyFalseCount })
  } catch (error) {
    console.error('Error occurred while fetching all emoteNotifs', error)
    return handleError(res, error, 'Unable to fetch all emoteNotifs')
  }
}

// Update emote notif
export async function updateEmoteNotif(req: Request, res: Response) {
  // hasReadCasually and hasReadDirectly will never be mixed up. List of IDs will always be all casual or all direct

  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const emoteNotifIDs =
      (req.body.emoteNotifIDs as string | undefined)?.split(',') ?? []
    // it will either be string 'casual' or 'direct'
    // isCasualRead is boolean version of that
    const isCasualRead = req.body.isCasualOrDirect === 'casual'
    const isMarkingUnread = req.body.isMarkingUnread
    const { hasReadCasuallyFalseCount, hasReadDirectlyFalseCount } = await updateEmoteNotifsInDB(emoteNotifIDs, isCasualRead, isMarkingUnread, decodedAccount)
    return handleSuccess(res, { hasReadCasuallyFalseCount, hasReadDirectlyFalseCount })
  } catch (error) {
    console.error('Error occurred while updating emote notifs', error)
    return handleError(res, error, 'Unable to update emote notifs')
  }
}

// fetch and Update emote notifs - this is called when user hits their notifications page
export async function fetchAndUpdateAllEmoteNotifs(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const skip = Number.parseInt(req.body.skip as string) || 0
    const limit = Number.parseInt(req.body.limit as string) || 10
    const orderBy = req.body.orderBy as keyof EmoteNotifResponse
    const orderDirection =
      (req.body.orderDirection as string | undefined) ?? 'desc'
    const notifType = req.query.notifType as NOTIF_TYPE

    const options: EmoteNotifQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      notifType,
    }

    const { emoteNotifs, hasReadCasuallyFalseCount, hasReadDirectlyFalseCount } = await fetchAndUpdateAllEmoteNotifsInDB(options, decodedAccount)
    return handleSuccess(res, { emoteNotifs, hasReadCasuallyFalseCount, hasReadDirectlyFalseCount })
  } catch (error) {
    console.error('Error occurred while updating emote notifs', error)
    return handleError(res, error, 'Unable to update emote notifs')
  }
}

// export async function deleteEmoteNotif(req: Request, res: Response) {
//   try {
//     const emoteNotifId = req.body.emoteNotifId as string
//     await deleteEmoteNotifInDB(emoteNotifId)
//     return handleSuccess(res, { message: `EmoteNotif with ID ${emoteNotifId} has been deleted` })
//   } catch (error) {
//     console.error('Error occurred while deleting emote notif', error)
//     return handleError(res, error, 'Unable to delete emote notif')
//   }
// }
