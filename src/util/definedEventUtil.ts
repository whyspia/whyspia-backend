import { UserV2TokenPublicResponseWithDisplayName } from '../types/user-v2.types'
import type { DefinedEventDocument } from '../models/defined-event.model'
import type { DefinedEventResponse } from '../types/defined-event.types'
import { mapUserV2TokenPublicResponse } from './userV2Util'

export function mapDefinedEventResponse(
  definedEventDoc: DefinedEventDocument | null,
  eventCreatorUserDoc: UserV2TokenPublicResponseWithDisplayName | null,
): DefinedEventResponse | null {
  if (!definedEventDoc) {
    return null
  }

  return {
    id: definedEventDoc._id.toString(),
    eventCreator: definedEventDoc.eventCreator,
    eventCreatorUser: mapUserV2TokenPublicResponse(eventCreatorUserDoc),
    eventName: definedEventDoc.eventName,
    eventDescription: definedEventDoc?.eventDescription || null,
    createdAt: (definedEventDoc as any).createdAt,
    updatedAt: (definedEventDoc as any).updatedAt,
  }
}
