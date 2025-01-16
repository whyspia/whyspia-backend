import { UserV2TokenPublicResponseWithDisplayName } from '../types/user-v2.types'
import { NOTIF_TYPE, type EmoteNotifDocument } from '../models/emote-notif.model'
import type { EmoteNotifSingleResponse } from '../types/emote-notif.types'
import { mapEmoteResponse } from './emoteUtil'
import { mapPingpplFollowResponse } from './pingpplFollowUtil'
import { mapSentEventResponse } from './sentEventUtil'
import { mapTAUResponse } from './tauUtil'
import { mapUserV2TokenPublicResponse } from './userV2Util'
import { mapCurrentlyResponse } from './currentlyUtil'
import { getMappingListOfWalletToUserToken } from '../services/user-v2.service'

export function mapEmoteNotifResponse(
  emoteNotifDoc: EmoteNotifDocument,
  receiverSymbolUserDoc: UserV2TokenPublicResponseWithDisplayName | null,
): EmoteNotifSingleResponse {
  // if (!emoteNotifDoc) {
  //   return null
  // }

  let notifData = null
  if (emoteNotifDoc.notifType === NOTIF_TYPE.EMOTE) notifData = mapEmoteResponse((emoteNotifDoc as any).notifData, (emoteNotifDoc as any).notifData?.senderUser, (emoteNotifDoc as any).notifData?.receiverUsers)
  if (emoteNotifDoc.notifType === NOTIF_TYPE.PINGPPL_FOLLOW) notifData = mapPingpplFollowResponse((emoteNotifDoc as any).notifData, (emoteNotifDoc as any).notifData?.eventSenderUser, (emoteNotifDoc as any).notifData?.followSenderUser)
  if (emoteNotifDoc.notifType === NOTIF_TYPE.PINGPPL_SENTEVENT) notifData = mapSentEventResponse((emoteNotifDoc as any).notifData, (emoteNotifDoc as any).notifData?.eventSenderUser)
  if (emoteNotifDoc.notifType === NOTIF_TYPE.TAU_SENT) notifData = mapTAUResponse((emoteNotifDoc as any).notifData, (emoteNotifDoc as any).notifData?.senderUser, (emoteNotifDoc as any).notifData?.receiverUser)
  if (emoteNotifDoc.notifType === NOTIF_TYPE.CURRENTLY_SHARED) notifData = mapCurrentlyResponse((emoteNotifDoc as any).notifData, (emoteNotifDoc as any).notifData?.senderUser)

  return {
    id: emoteNotifDoc._id.toString(),
    notifData,
    notifType: emoteNotifDoc.notifType,
    receiverSymbol: emoteNotifDoc.receiverSymbol,
    receiverSymbolUser: mapUserV2TokenPublicResponse(receiverSymbolUserDoc),
    hasReadCasually: emoteNotifDoc.hasReadCasually,
    hasReadDirectly: emoteNotifDoc.hasReadDirectly,
    context: (emoteNotifDoc as any).context,
    createdAt: (emoteNotifDoc as any).createdAt,
  }
}

// this is really just adding relative display data to notifData fields
export async function mapNotifData(initialNotifData: any, notifType: NOTIF_TYPE, requestingWallet?: string) {
  let fieldMapping = {}

  switch (notifType) {
    case NOTIF_TYPE.EMOTE:
      fieldMapping = {
        'senderPrimaryWallet': 'senderUser',
        'receiverSymbols': 'receiverUsers'
      }
      break

    case NOTIF_TYPE.PINGPPL_FOLLOW:
      fieldMapping = {
        'eventSender': 'eventSenderUser',
        'followSender': 'followSenderUser'
      }
      break

    case NOTIF_TYPE.PINGPPL_SENTEVENT:
      fieldMapping = {
        'eventSender': 'eventSenderUser'
      }
      break

    case NOTIF_TYPE.TAU_SENT:
      fieldMapping = {
        'senderPrimaryWallet': 'senderUser',
        'receiverPrimaryWallet': 'receiverUser'
      }
      break

    case NOTIF_TYPE.CURRENTLY_SHARED:
      fieldMapping = {
        'senderPrimaryWallet': 'senderUser'
      }
      break
  }

  // Get user display names for this notifType
  const userWithDisplayNameMap = await getMappingListOfWalletToUserToken(
    [initialNotifData],
    fieldMapping,
    requestingWallet as string
  )

  // Update the fields with display names
  Object.entries(fieldMapping).forEach(([walletField, userField]: any) => {
    const wallet = initialNotifData[walletField]
    if (Array.isArray(wallet)) {
      // Handle arrays of wallets (like receiverWallets)
      initialNotifData[userField] = wallet.map(w => userWithDisplayNameMap[w])
    } else if (wallet) {
      // Handle single wallet
      initialNotifData[userField] = userWithDisplayNameMap[wallet]
    }
  })

  return initialNotifData
}
