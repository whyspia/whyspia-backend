import type { TAUDocument } from '../models/tau.model'
import type { TAUResponse } from '../types/tau.types'

export function mapTAUResponse(
  tauDoc: TAUDocument | null
): TAUResponse | null {
  if (!tauDoc) {
    return null
  }

  return {
    id: tauDoc._id.toString(),
    senderSymbol: tauDoc?.senderSymbol,
    receiverSymbol: tauDoc?.receiverSymbol,
    additionalMessage: tauDoc?.additionalMessage,
    createdAt: (tauDoc as any)?.createdAt,
  }
}
