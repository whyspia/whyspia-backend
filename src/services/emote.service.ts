import mongoose from 'mongoose'
import type { FilterQuery, PipelineStage } from 'mongoose'

import { EmoteModel } from '../models/emote.model'
import type { EmoteDocument } from '../models/emote.model'
import type { EmoteQueryOptions, EmoteRequest, EmoteResponse } from '../types/emote.types'
import { InternalServerError } from './errors'
import { mapEmoteResponse } from '../util/emoteUtil'
import escapeStringRegexp from 'escape-string-regexp'
import { createSymbolInDB, fetchAllSymbolsFromDB } from './symbol.service'
import { createEmoteNotifInDB } from './emote-notif.service'

export async function createEmoteInDB(emoteData: Partial<EmoteRequest>): Promise<EmoteResponse | null> {
  if (!emoteData.sentSymbols || emoteData.sentSymbols.length === 0) {
    console.error('No sentSymbols provided')
    throw new InternalServerError('No sentSymbols provided')
  }

  for (const sentSymbol of emoteData.sentSymbols) {
    // Check if sentSymbol exists
    const symbols = await fetchAllSymbolsFromDB({ search: sentSymbol } as any)
    if (symbols?.length === 0) {
      // Create the sentSymbol if it does not exist
      await createSymbolInDB({ name: sentSymbol.toLowerCase() })
    }
  }

  try {
    const emoteBuildData = {
      senderTwitterUsername: emoteData.senderTwitterUsername as string,
      receiverSymbols: emoteData.receiverSymbols as string[],
      sentSymbols: emoteData?.sentSymbols as string[],
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

export async function fetchEmoteFromDB(EmoteId: string): Promise<EmoteResponse | null> {
  try {
    const emoteDoc = await EmoteModel.findById(EmoteId)
    return emoteDoc ? mapEmoteResponse(emoteDoc.toObject()) as EmoteResponse : null
  } catch (error) {
    console.error('Error occurred while fetching Emote from DB', error)
    throw new InternalServerError('Failed to fetch Emote from DB')
  }
}

export async function fetchAllEmotesFromDB(
  options: EmoteQueryOptions
): Promise<EmoteResponse[]> {
  try {

    const { skip, limit, orderBy, senderTwitterUsername, receiverSymbols, sentSymbols } = options
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
    // decision: if multiple symbols in receiverSymbols, then each returned Emote must have receiverSymbols field that contains all requested. So what i mean is that it wont return Emotes with just the first receiverSymbol - it has to be ALL in the list. BUT, it also accepts extras in sentSymbols too AS LONG as it has ALL requested sentSymbols.
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


    // TODO: test the crap out dis - it confuse me
    // decision: if multiple symbols in sentSymbols, then each returned Emote must have sentSymbols field that contains all requested. So what i mean is that it wont return Emotes with just the first receiverSymbol - it has to be ALL in the list. BUT, it also accepts extras in sentSymbols too AS LONG as it has ALL requested sentSymbols.
    if (sentSymbols && sentSymbols?.length > 0) {
      const regexOrConditions = sentSymbols.map(sentSymbol => ({
        sentSymbols: { $regex: new RegExp("^" + escapeStringRegexp(sentSymbol) + "$", 'iu') }
      }));
      filterOptions.push({
        $and: regexOrConditions,  // the AND is what enforces the decision above. OR will be different functionality
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

export async function fetchLastUnrespondedReceivedEmotesFromDB(
  receiverSymbol: string,
  options: EmoteQueryOptions
): Promise<EmoteResponse[]> {
  const { skip, limit } = options

  try {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          receiverSymbols: receiverSymbol
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: "$senderTwitterUsername",
          latestEmote: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "emotes",
          let: { senderUsername: "$_id", lastEmoteTimestamp: "$latestEmote.createdAt" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$senderTwitterUsername", receiverSymbol] },
                    { $gt: ["$createdAt", "$$lastEmoteTimestamp"] }
                  ]
                }
              }
            }
          ],
          as: "responseCheck"
        }
      },
      {
        $match: {
          "responseCheck": { $size: 0 }
        }
      },
      {
        $replaceRoot: { newRoot: "$latestEmote" }
      },
      { $skip: skip }, // Add skip stage
      { $limit: limit } // Add limit stage
    ]

    const emotes = await EmoteModel.aggregate(pipeline).exec()
    return emotes.map(mapEmoteResponse) as EmoteResponse[]
  } catch (error) {
    console.error('Error occurred while fetching last unresponded received emotes', error)
    throw new InternalServerError('Failed to fetch last unresponded received emotes')
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
