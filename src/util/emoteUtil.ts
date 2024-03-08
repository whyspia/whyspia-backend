import type { EmoteDocument } from '../models/emote.model'
import type { EmoteResponse } from '../types/emote.types'

export function mapEmoteResponse(
  emoteDoc: EmoteDocument | null
): EmoteResponse | null {
  if (!emoteDoc) {
    return null
  }

  return {
    id: emoteDoc._id.toString(),
    senderTwitterUsername: emoteDoc.senderTwitterUsername,
    receiverSymbols: emoteDoc.receiverSymbols,
    symbol: emoteDoc.symbol,
    timestamp: (emoteDoc as any).createdAt,
  }
}
