import mongoose from 'mongoose'
import type { FilterQuery } from 'mongoose'

import { EmoteModel } from '../models/emote.model'
import type { EmoteDocument } from '../models/emote.model'
import type { EmoteQueryOptions, EmoteRequest, EmoteResponse } from '../types/emote.types'
import { InternalServerError } from './errors'
import { mapEmoteResponse } from '../util/emoteUtil'
import escapeStringRegexp from 'escape-string-regexp'
import { createSymbolInDB, fetchAllSymbolsFromDB } from './symbol.service'
import { createEmoteNotifInDB } from './emote-notif.service'

export async function createEmoteInDB(emoteData: Partial<EmoteRequest>): Promise<EmoteResponse | null> {
  // Check if symbol exists
  const symbols = await fetchAllSymbolsFromDB({ search: emoteData.symbol } as any)
  if (symbols?.length === 0) {
    // Create the symbol if it does not exist
    await createSymbolInDB({ name: emoteData?.symbol?.toLowerCase() });
  }

  try {
    const emoteBuildData = {
      senderTwitterUsername: emoteData.senderTwitterUsername as string,
      receiverSymbols: emoteData.receiverSymbols as string[],
      symbol: emoteData?.symbol?.toLowerCase() as string,
    }
    const emoteDoc = EmoteModel.build(emoteBuildData)
    const createdEmote = await EmoteModel.create(emoteDoc)

    // if one of receiverSymbol is X user, then do notification stuff. Otherwise, no need (although will be need for autonomous agents at some point probably)
    // const pattern = /^@?(\w){1,15}$/
    // const isPossibleXUser = pattern.test(emoteData.receiverSymbol as string)
    // if (isPossibleXUser) {
    //   await createEmoteNotifInDB({ emoteID: createdEmote._id.toString() })
    // }

    const pattern = /^@?(\w){1,15}$/
    emoteData.receiverSymbols?.forEach(async (receiverSymbol) => {
      const isPossibleXUser = pattern.test(receiverSymbol)
      if (isPossibleXUser) {
        await createEmoteNotifInDB({ emoteID: createdEmote._id.toString(), receiverSymbol })
      }
    })

    return mapEmoteResponse(createdEmote)
  } catch (error) {
    console.error('Error occurred while creating emote in DB', error)
    throw new InternalServerError('Failed to create emote in DB')
  }

}

// export async function fetchEmoteFromDB(EmoteId: string): Promise<EmoteResponse | null> {
//   try {
//     const emoteDoc = await EmoteModel.findById(EmoteId)
//     return emoteDoc ? emoteDoc.toObject() : null
//   } catch (error) {
//     console.error('Error occurred while fetching Emote from DB', error)
//     throw new InternalServerError('Failed to fetch Emote from DB')
//   }
// }

export async function fetchAllEmotesFromDB(
  options: EmoteQueryOptions
): Promise<EmoteResponse[]> {
  try {

    const { skip, limit, orderBy, senderTwitterUsername, receiverSymbols, symbol } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<EmoteDocument>[] = []

    if (senderTwitterUsername) {
      filterOptions.push({
        $or: [
          { senderTwitterUsername: { $regex: new RegExp("^" + senderTwitterUsername + "$", 'iu') } },
        ],
      })
    }

    // TODO: test the crap out dis - it confuse me
    // decision: if multiple symbols in receiverSymbols, then each returned Emote must have receiverSymbols field that contains all requested. So what i mean is that it wont return Emotes with just the first receiverSymbol - it has to be ALL in the list
    if (receiverSymbols && receiverSymbols?.length > 0) {
      // filterOptions.push({
      //   $or: [
      //     { receiverSymbol: { $regex: new RegExp("^" + receiverSymbol + "$", 'iu') } },
      //   ],
      // })
      const regexOrConditions = receiverSymbols.map(symbol => ({
        receiverSymbols: { $regex: new RegExp("^" + escapeStringRegexp(symbol) + "$", 'iu') }
      }));
      filterOptions.push({
        $and: regexOrConditions,  // the AND is what enforces the decision above. OR will be different functionality
      })
    }

    if (symbol) {
      filterOptions.push({
        $or: [
          { symbol: { $regex: new RegExp("^" + symbol + "$", 'iu') } },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const emoteDocs: EmoteDocument[] = await EmoteModel
      .find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    return emoteDocs.map((doc) => mapEmoteResponse(doc) as EmoteResponse)
  } catch (error) {
    console.error('Error occurred while fetching all emotes from DB', error)
    throw new InternalServerError('Failed to fetch all emotes from DB')
  }
}

// export async function updateEmoteInDB(EmoteId: string, updatedData: Partial<EmoteResponse>): Promise<EmoteResponse | null> {
//   try {
//     const updatedEmoteDoc = await EmoteModel.findByIdAndUpdate(EmoteId, updatedData, { new: true })
//     return updatedEmoteDoc ? updatedEmoteDoc.toObject() : null
//   } catch (error) {
//     console.error('Error occurred while updating Emote in DB', error)
//     throw new InternalServerError('Failed to update Emote in DB')
//   }
// }

export async function deleteEmoteInDB(emoteId: string): Promise<void> {
  try {
    await EmoteModel.findByIdAndDelete(emoteId)
  } catch (error) {
    console.error('Error occurred while deleting emote from DB', error)
    throw new InternalServerError('Failed to delete emote from DB')
  }
}
