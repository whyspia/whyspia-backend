import type { Request, Response } from 'express'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

import { handleError, handleSuccess } from '../lib/base'
import {
  createEmoteNotifInDB,
  fetchAllEmoteNotifsFromDB,
  updateEmoteNotifsInDB,
  // deleteEmoteNotifInDB,
} from '../services/emote-notif.service'
import type { EmoteNotifQueryOptions, EmoteNotifResponse } from '../types/emote-notif.types'

export async function createEmoteNotif(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const requestData = {
      emoteID: reqBody.emoteID,
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
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof EmoteNotifResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'

    const options: EmoteNotifQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
    }

    const emoteNotifs = await fetchAllEmoteNotifsFromDB(options)
    return handleSuccess(res, { emoteNotifs })
  } catch (error) {
    console.error('Error occurred while fetching all emoteNotifs', error)
    return handleError(res, error, 'Unable to fetch all emoteNotifs')
  }
}

// Update emote notif
export async function updateEmoteNotif(req: Request, res: Response) {
  // hasReadCasually and hasReadDirectly will never be mixed up. List of IDs will always be all casual or all direct

  try {
    const emoteNotifIDs =
      (req.body.emoteNotifIDs as string | undefined)?.split(',') ?? []
      // it will either be a casual read OR direct read
    const isCasualRead = req.body.isCasualRead as boolean
    const updatedEmoteNotifs = await updateEmoteNotifsInDB(emoteNotifIDs, isCasualRead)
    return handleSuccess(res, { updatedEmoteNotifs })
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
