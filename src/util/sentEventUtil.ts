import { DefinedEventResponse } from '../types/defined-event.types'
import type { SentEventDocument } from '../models/sent-event.model'
import type { SentEventResponse } from '../types/sent-event.types'
import { mapDefinedEventResponse } from './definedEventUtil'

export function mapSentEventResponse(
  sentEventDoc: SentEventDocument | null
): SentEventResponse | null {
  if (!sentEventDoc) {
    return null
  }

  return {
    id: sentEventDoc?._id?.toString() || sentEventDoc?.id,
    eventSender: sentEventDoc.eventSender,
    eventName: sentEventDoc.eventName,
    definedEvent: mapDefinedEventResponse((sentEventDoc as any)?.definedEvent) as DefinedEventResponse,
    createdAt: (sentEventDoc as any).createdAt,
    updatedAt: (sentEventDoc as any).updatedAt,
  }
}
