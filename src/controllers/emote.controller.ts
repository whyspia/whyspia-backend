import type { Request, Response } from 'express'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

import { handleError, handleSuccess } from '../lib/base'
import {
  createEmoteInDB,
  fetchAllEmotesFromDB,
  // fetchemoteFromDB,
  // updateemoteInDB,
  deleteEmoteInDB,
} from '../services/emote.service'
import type { EmoteQueryOptions, EmoteResponse } from '../types/emote.types'

export async function createEmote(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const reqBody = req.body
    const receiverSymbols = (reqBody.receiverSymbols as string | undefined)?.split(',') ?? []
    const sentSymbols = (reqBody.sentSymbols as string | undefined)?.split(',') ?? []
    const requestData = {
      senderTwitterUsername: decodedAccount.twitterUsername,
      receiverSymbols,
      sentSymbols,
    }
    const emote = await createEmoteInDB(requestData)
    return handleSuccess(res, { emote })
  } catch (error) {
    console.error('Error occurred while creating emote', error)
    return handleError(res, error, 'Unable to create emote')
  }
}

// Fetch emote
// export async function fetchemote(req: Request, res: Response) {
//   try {
//     const emoteId = req.query.emoteId as string
//     const emote = await fetchemoteFromDB(emoteId)
//     return handleSuccess(res, { emote })
//   } catch (error) {
//     console.error('Error occurred while fetching emote', error)
//     return handleError(res, error, 'Unable to fetch emote')
//   }
// }

export async function fetchAllEmotes(req: Request, res: Response) {
  try {
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof EmoteResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    // const search = (req.query.search as string) || null
    const senderTwitterUsername = (req.query.senderTwitterUsername as string) || null
    const receiverSymbols = req.query.receiverSymbols && req.query.receiverSymbols !== '' ? (req.query.receiverSymbols as string | undefined)?.split(',') as any : []
    const sentSymbols = req.query.sentSymbols && req.query.sentSymbols !== '' ? (req.query.sentSymbols as string | undefined)?.split(',') as any : []

    const options: EmoteQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      // search,
      senderTwitterUsername,
      receiverSymbols,
      sentSymbols,
    }

    const emotes = await fetchAllEmotesFromDB(options)
    return handleSuccess(res, { emotes })
  } catch (error) {
    console.error('Error occurred while fetching all emotes', error)
    return handleError(res, error, 'Unable to fetch all emotes')
  }
}

// Update emote
// export async function updateemote(req: Request, res: Response) {
//   try {
//     const emoteId = req.body.emoteId as string
//     const updatedData = req.body.updatedData as Partial<EmoteResponse>
//     const updatedemote = await updateemoteInDB(emoteId, updatedData)
//     return handleSuccess(res, { updatedemote })
//   } catch (error) {
//     console.error('Error occurred while updating emote', error)
//     return handleError(res, error, 'Unable to update emote')
//   }
// }

export async function deleteEmote(req: Request, res: Response) {
  try {
    const emoteId = req.body.emoteId as string
    await deleteEmoteInDB(emoteId)
    return handleSuccess(res, { message: `Emote with ID ${emoteId} has been deleted` })
  } catch (error) {
    console.error('Error occurred while deleting emote', error)
    return handleError(res, error, 'Unable to delete emote')
  }
}
