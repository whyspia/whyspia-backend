import type { DefinedEventDocument } from '../models/defined-event.model'
import type { DefinedEventResponse } from '../types/defined-event.types'

export function mapDefinedEventResponse(
  definedEventDoc: DefinedEventDocument | null
): DefinedEventResponse | null {
  if (!definedEventDoc) {
    return null
  }

  return {
    id: definedEventDoc._id.toString(),
    eventCreator: definedEventDoc.eventCreator,
    eventName: definedEventDoc.eventName,
    eventDescription: definedEventDoc?.eventDescription || null,
    timestamp: (definedEventDoc as any).updatedAt,
  }
}
