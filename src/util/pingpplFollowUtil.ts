import type { PingpplFollowDocument } from '../models/pingppl-follow.model'
import type { PingpplFollowResponse } from '../types/pingppl-follow.types'

export function mapPingpplFollowResponse(
  pingpplFollowDoc: PingpplFollowDocument | null
): PingpplFollowResponse | null {
  if (!pingpplFollowDoc) {
    return null
  }

  return {
    id: pingpplFollowDoc?._id?.toString() || pingpplFollowDoc?.id,
    eventNameFollowed: pingpplFollowDoc.eventNameFollowed,
    eventSender: pingpplFollowDoc.eventSender,
    followSender: pingpplFollowDoc.followSender,
    createdAt: (pingpplFollowDoc as any).createdAt,
    // updatedAt: (pingpplFollowDoc as any).updatedAt,
  }
}
