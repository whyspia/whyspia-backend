import { mapUserV2TokenPublicResponse } from './userV2Util'
import { CurrentlyResponse } from '../types/currently.types'
import { CurrentlyDocument } from '../models/currently.model'
import { UserV2TokenPublicResponseWithDisplayName } from '../types/user-v2.types'

export function mapCurrentlyResponse(
  currentlyDoc: CurrentlyDocument | null,
  senderUserDoc: UserV2TokenPublicResponseWithDisplayName | null,
): CurrentlyResponse | null {
  if (!currentlyDoc) {
    return null
  }

  return {
    id: currentlyDoc?._id?.toString() || currentlyDoc?.id,
    senderPrimaryWallet: currentlyDoc?.senderPrimaryWallet,
    senderUser: mapUserV2TokenPublicResponse(senderUserDoc),
    place: currentlyDoc?.place,
    wantOthersToKnowTags: currentlyDoc?.wantOthersToKnowTags,
    status: currentlyDoc?.status,
    createdAt: (currentlyDoc as any)?.createdAt,
  }
}
