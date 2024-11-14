import { UserV2Document } from '../models/user-v2.model'
import type { TAUDocument } from '../models/tau.model'
import type { TAUResponse } from '../types/tau.types'
import { mapUserV2TokenPublicResponse } from './userV2Util'

export function mapTAUResponse(
  tauDoc: TAUDocument | null,
  senderUserDoc: UserV2Document | null,
  receiverUserDoc: UserV2Document | null,
): TAUResponse | null {
  if (!tauDoc) {
    return null
  }

  return {
    id: tauDoc?._id?.toString() || tauDoc?.id,
    senderUser: mapUserV2TokenPublicResponse(senderUserDoc),
    receiverUser: mapUserV2TokenPublicResponse(receiverUserDoc),
    additionalMessage: tauDoc?.additionalMessage,
    createdAt: (tauDoc as any)?.createdAt,
  }
}
