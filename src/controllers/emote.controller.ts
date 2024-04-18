import type { Request, Response } from 'express'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

import { handleError, handleSuccess } from '../lib/base'
import {
  createEmoteInDB,
  fetchAllEmotesFromDB,
  // updateemoteInDB,
  deleteEmoteInDB,
  fetchUnrespondedEmotesFromDB,
  fetchEmoteFromDB,
  findEmoteReplyChainInDB,
} from '../services/emote.service'
import type { EmoteNoUContextQueryOptions, EmoteQueryOptions, EmoteResponse } from '../types/emote.types'

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

export async function createEmotes(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const emotesData = req.body.emotes // Assuming this is an array of objects similar to what createEmote expects for a single emote
    const results = []

    const currentDateTime = new Date()

    for (const emoteData of emotesData) {
      const receiverSymbols = (emoteData.receiverSymbols) ?? []
      const sentSymbols = (emoteData.sentSymbols) ?? []
      const requestData = {
        senderTwitterUsername: decodedAccount.twitterUsername,
        receiverSymbols,
        sentSymbols,
        timestamp: currentDateTime,
      }
      const emote = await createEmoteInDB(requestData)
      results.push(emote)
    }

    return handleSuccess(res, { emotes: results })
  } catch (error) {
    console.error('Error occurred while creating emotes', error)
    return handleError(res, error, 'Unable to create emotes')
  }
}

export async function fetchEmote(req: Request, res: Response) {
  try {
    const emoteID = req.query.emoteID as string
    const emote = await fetchEmoteFromDB(emoteID)
    return handleSuccess(res, { emote })
  } catch (error) {
    console.error('Error occurred while fetching emote', error)
    return handleError(res, error, 'Unable to fetch emote')
  }
}

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

// this is for no u context. last emotes for specific user that they have not responded to and is latest one from that sender
export async function fetchUnrespondedEmotes(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof EmoteResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    // const search = (req.query.search as string) || null
    const senderTwitterUsername = (req.query.senderTwitterUsername as string) || null
    // const receiverSymbols = req.query.receiverSymbols && req.query.receiverSymbols !== '' ? (req.query.receiverSymbols as string | undefined)?.split(',') as any : []
    const sentSymbols = req.query.sentSymbols && req.query.sentSymbols !== '' ? (req.query.sentSymbols) as any : []
    const fetchSentOrReceived = (req.query.fetchSentOrReceived as string) ?? 'received'

    const options: EmoteNoUContextQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      // search,
      senderTwitterUsername,
      receiverSymbols: [],
      sentSymbols,
      fetchSentOrReceived,
    }

    const emotes = await fetchUnrespondedEmotesFromDB(decodedAccount?.twitterUsername, options)
    return handleSuccess(res, { emotes })
  } catch (error) {
    console.error('Error occurred while fetching unresponded emotes', error)
    return handleError(res, error, 'Unable to fetch unresponded emotes')
  }
}

export async function findEmoteReplyChain(req: Request, res: Response) {
  try {
    const emoteID = req.query.emoteID as string
    // const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof EmoteResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    // const search = (req.query.search as string) || null
    const senderTwitterUsername = (req.query.senderTwitterUsername as string) || null
    // const receiverSymbols = req.query.receiverSymbols && req.query.receiverSymbols !== '' ? (req.query.receiverSymbols as string | undefined)?.split(',') as any : []
    const sentSymbols = req.query.sentSymbols && req.query.sentSymbols !== '' ? (req.query.sentSymbols) as any : []

    const options: EmoteQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      // search,
      senderTwitterUsername,
      receiverSymbols: [],
      sentSymbols,
    }

    const emotes = await findEmoteReplyChainInDB(emoteID)
    return handleSuccess(res, { emotes })
  } catch (error) {
    console.error('Error occurred while fetching findEmoteReplyChain', error)
    return handleError(res, error, 'Unable to fetch findEmoteReplyChain')
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
