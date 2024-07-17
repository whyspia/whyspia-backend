import { DefinedEventResponse } from "./defined-event.types"

export type SentEventRequest = {
  id: string
  eventSender: string
  eventName: string
  definedEventID: string
  timestamp: Date
}

export type SentEventResponse = {
  id: string
  eventSender: string
  eventName: string
  definedEvent: DefinedEventResponse
  createdAt: Date
  updatedAt: Date
}

export type SentEventQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof SentEventResponse
  orderDirection: string
  eventSender: string | null
  eventName: string | null
}