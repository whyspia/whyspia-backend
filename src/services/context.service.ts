
import { fetchAllEmotesFromDB, fetchEmoteFromDB } from './emote.service'
import { EMOTE_CONTEXTS } from '../util/contextUtil'
import { EmoteResponse } from '../types/emote.types'
import { NOTIF_TYPE } from '../models/emote-notif.model'

// if there is input emote data, dont need emoteID arg
// currently only calcing one context per emote
export async function getContextOfEmote(inputEmote: EmoteResponse | null, emoteID: string | null) {
  let inputEmoteFromID = null
  if (!inputEmote) {
    if (!emoteID || emoteID === '') {
      throw new Error('emoteID must be a non-empty string');
    }

    // get emote using emoteID to first get the timestamp
    inputEmoteFromID = await fetchEmoteFromDB(emoteID, true)
  }
  
  const inputEmoteFinal = inputEmote ?? inputEmoteFromID

  if (inputEmoteFinal?.receiverSymbols.includes(EMOTE_CONTEXTS.PINGPPL)) {
    return EMOTE_CONTEXTS.PINGPPL
  }

  // find and loop through all emotes at same timestamp as input emote (or whatever else emote data identifies the context)
  const queryOptions = {
    skip: 0,
    limit: 10,  // NOTE: this limits number of contexts at once
    orderBy: 'createdAt',
    orderDirection: 'desc',
    senderTwitterUsername: null,
    receiverSymbols: null,
    sentSymbols: null,
    createdAt: inputEmoteFinal?.createdAt,
  } as any
  const sameTimestampEmotes = await fetchAllEmotesFromDB(queryOptions, true)

  // need to filter out inputEmoteFinal
  // const sameTimestampEmotesFiltered = sameTimestampEmotes.filter(emote => emote.id !== inputEmoteFinal?.id)

  // TODO: maybe in the future better to compute this using LLM
  // for each emote, need some way to detect if that emote identifies a specific context - think only way is to loop all contexts for each emote (but this doesnt feel right tbh) - this maybe needs to be separate fx but idk

  let discoveredContext = null
  
  for (const sameTimestampEmote of Object.values(sameTimestampEmotes)) {
    // there will be certain contexts where this is the case and some where this is not the case
    const isSenderSameInSameTimestampEmoteAsMainEmote = sameTimestampEmote.senderTwitterUsername === inputEmoteFinal?.senderTwitterUsername

    if (isSenderSameInSameTimestampEmoteAsMainEmote) {

      if (sameTimestampEmote.sentSymbols.includes('symbol')) {

        if (sameTimestampEmote.receiverSymbols.includes(EMOTE_CONTEXTS.NOU)) {
          discoveredContext = EMOTE_CONTEXTS.NOU
        }

        if (sameTimestampEmote.receiverSymbols.includes(EMOTE_CONTEXTS.NANA)) {
          discoveredContext = EMOTE_CONTEXTS.NANA
        }

      }

    }

    if (discoveredContext) {
      break
    }

    // for (const context of Object.values(EMOTE_CONTEXTS)) {
    //   console.log(color);
    // }
  }
  
  return discoveredContext

}

export async function getContextOfNotif(inputEmote: EmoteResponse | null, notifType: NOTIF_TYPE) {
  if (inputEmote) {
    return await getContextOfEmote(inputEmote, null)
  } else {
    if (notifType === NOTIF_TYPE.PINGPPL_FOLLOW) {
      return EMOTE_CONTEXTS.PINGPPL
    }
  }

  return EMOTE_CONTEXTS.NO_CONTEXT
}
