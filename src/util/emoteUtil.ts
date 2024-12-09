import { UserV2TokenPublicResponseWithDisplayName } from '../types/user-v2.types'
import type { EmoteDocument } from '../models/emote.model'
import type { EmoteResponse, EmoteResponseWithNoUChainPreviews } from '../types/emote.types'
import { mapUserV2TokenPublicResponse } from './userV2Util'

export function mapEmoteResponse(
  emoteDoc: EmoteDocument | null,
  senderUser: UserV2TokenPublicResponseWithDisplayName | null,
  receiverUsers: UserV2TokenPublicResponseWithDisplayName[] | null,
): EmoteResponse | null {
  if (!emoteDoc) {
    return null
  }

  return {
    id: emoteDoc?._id?.toString() || emoteDoc?.id,
    senderPrimaryWallet: emoteDoc.senderPrimaryWallet,
    senderUser: mapUserV2TokenPublicResponse(senderUser),
    receiverSymbols: emoteDoc.receiverSymbols,
    receiverUsers: receiverUsers?.map((rUser: any) => mapUserV2TokenPublicResponse(rUser)) as any,
    sentSymbols: emoteDoc.sentSymbols,
    createdAt: (emoteDoc as any).createdAt,
    context: (emoteDoc as any).context,
  }
}

export function mapEmoteResponseWithNoUChainPreviews(
  emoteDoc: EmoteDocument | null,
  senderUser: UserV2TokenPublicResponseWithDisplayName | null,
  receiverUsers: UserV2TokenPublicResponseWithDisplayName[] | null,
): EmoteResponseWithNoUChainPreviews | null {
  if (!emoteDoc) {
    return null
  }

  return {
    id: emoteDoc._id.toString(),
    senderPrimaryWallet: emoteDoc.senderPrimaryWallet,
    senderUser: mapUserV2TokenPublicResponse(senderUser),
    receiverSymbols: emoteDoc.receiverSymbols,
    receiverUsers: receiverUsers?.map((rUser: any) => mapUserV2TokenPublicResponse(rUser)) as any,
    sentSymbols: emoteDoc.sentSymbols,
    createdAt: (emoteDoc as any).createdAt,
    context: (emoteDoc as any).context,
    chainPreview: (emoteDoc as any).chainPreview,
    totalChainLength: (emoteDoc as any).totalChainLength,
  }
}
