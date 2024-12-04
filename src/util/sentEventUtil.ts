import { DefinedEventResponse } from '../types/defined-event.types'
import type { SentEventDocument } from '../models/sent-event.model'
import type { SentEventResponse } from '../types/sent-event.types'
import { mapDefinedEventResponse } from './definedEventUtil'
import { UserV2TokenPublicResponseWithDisplayName } from '../types/user-v2.types'
import { mapUserV2TokenPublicResponse } from './userV2Util'

export function mapSentEventResponse(
  sentEventDoc: SentEventDocument | null,
  eventSenderUserDoc: UserV2TokenPublicResponseWithDisplayName | null,
): SentEventResponse | null {
  if (!sentEventDoc) {
    return null
  }

  return {
    id: sentEventDoc?._id?.toString() || sentEventDoc?.id,
    eventSender: sentEventDoc.eventSender,
    eventSenderUser: mapUserV2TokenPublicResponse(eventSenderUserDoc),
    eventName: sentEventDoc.eventName,
    definedEvent: mapDefinedEventResponse((sentEventDoc as any)?.definedEvent, null) as DefinedEventResponse,
    createdAt: (sentEventDoc as any).createdAt,
    updatedAt: (sentEventDoc as any).updatedAt,
  }
}
