import { UserV2TokenPublicResponseWithDisplayName } from '../types/user-v2.types'
import type { PingpplFollowDocument } from '../models/pingppl-follow.model'
import type { PingpplFollowResponse } from '../types/pingppl-follow.types'
import { mapUserV2TokenPublicResponse } from './userV2Util'

export function mapPingpplFollowResponse(
  pingpplFollowDoc: PingpplFollowDocument | null,
  eventSenderUserDoc: UserV2TokenPublicResponseWithDisplayName | null,
  followSenderUserDoc: UserV2TokenPublicResponseWithDisplayName | null,
): PingpplFollowResponse | null {
  if (!pingpplFollowDoc) {
    return null
  }

  return {
    id: pingpplFollowDoc?._id?.toString() || pingpplFollowDoc?.id,
    eventNameFollowed: pingpplFollowDoc.eventNameFollowed,
    eventSender: pingpplFollowDoc.eventSender,
    eventSenderUser: mapUserV2TokenPublicResponse(eventSenderUserDoc),
    followSender: pingpplFollowDoc.followSender,
    followSenderUser: mapUserV2TokenPublicResponse(followSenderUserDoc),
    createdAt: (pingpplFollowDoc as any).createdAt,
    // updatedAt: (pingpplFollowDoc as any).updatedAt,
  }
}
