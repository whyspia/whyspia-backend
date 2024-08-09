import { NOTIF_TYPE, type EmoteNotifDocument } from '../models/emote-notif.model'
import type { EmoteNotifSingleResponse } from '../types/emote-notif.types'
import { mapEmoteResponse } from './emoteUtil'
import { mapPingpplFollowResponse } from './pingpplFollowUtil'
import { mapSentEventResponse } from './sentEventUtil'
import { mapTAUResponse } from './tauUtil'

export function mapEmoteNotifResponse(
  emoteNotifDoc: EmoteNotifDocument
): EmoteNotifSingleResponse {
  // if (!emoteNotifDoc) {
  //   return null
  // }

  let notifData = null
  if (emoteNotifDoc.notifType === NOTIF_TYPE.EMOTE) notifData = mapEmoteResponse((emoteNotifDoc as any).notifData)
  if (emoteNotifDoc.notifType === NOTIF_TYPE.PINGPPL_FOLLOW) notifData = mapPingpplFollowResponse((emoteNotifDoc as any).notifData)
  if (emoteNotifDoc.notifType === NOTIF_TYPE.PINGPPL_SENTEVENT) notifData = mapSentEventResponse((emoteNotifDoc as any).notifData)
  if (emoteNotifDoc.notifType === NOTIF_TYPE.TAU_SENT) notifData = mapTAUResponse((emoteNotifDoc as any).notifData)

  return {
    id: emoteNotifDoc._id.toString(),
    notifData,
    notifType: emoteNotifDoc.notifType,
    receiverSymbol: emoteNotifDoc.receiverSymbol,
    hasReadCasually: emoteNotifDoc.hasReadCasually,
    hasReadDirectly: emoteNotifDoc.hasReadDirectly,
    context: (emoteNotifDoc as any).context,
    createdAt: (emoteNotifDoc as any).createdAt,
  }
}
