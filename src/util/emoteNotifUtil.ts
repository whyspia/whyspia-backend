import type { EmoteNotifDocument } from '../models/emote-notif.model'
import type { EmoteNotifResponse, EmoteNotifSingleResponse } from '../types/emote-notif.types'
import { mapEmoteResponse } from './emoteUtil'

export function mapEmoteNotifResponse(
  emoteNotifDoc: EmoteNotifDocument
): EmoteNotifSingleResponse {
  // if (!emoteNotifDoc) {
  //   return null
  // }

  return {
    id: emoteNotifDoc._id.toString(),
    emoteData: mapEmoteResponse((emoteNotifDoc as any).emoteData),
    receiverSymbol: emoteNotifDoc.receiverSymbol,
    hasReadCasually: emoteNotifDoc.hasReadCasually,
    hasReadDirectly: emoteNotifDoc.hasReadDirectly,
    timestamp: (emoteNotifDoc as any).createdAt,
  }
}
