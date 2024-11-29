import type { TAUDocument } from '../models/tau.model'
import type { TAUResponse } from '../types/tau.types'
import { UserV2TokenPublicResponseWithDisplayName } from '../types/user-v2.types'

export function mapTAUResponse(
  tauDoc: TAUDocument | null,
  senderUser: UserV2TokenPublicResponseWithDisplayName | null,
  receiverUser: UserV2TokenPublicResponseWithDisplayName | null,
): TAUResponse | null {
  if (!tauDoc) {
    return null
  }

  return {
    id: tauDoc?._id?.toString() || tauDoc?.id,
    senderPrimaryWallet: tauDoc?.senderPrimaryWallet,
    receiverPrimaryWallet: tauDoc?.receiverPrimaryWallet,
    senderUser,
    receiverUser,
    additionalMessage: tauDoc?.additionalMessage,
    createdAt: (tauDoc as any)?.createdAt,
  }
}
