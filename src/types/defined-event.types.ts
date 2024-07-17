export type DefinedEventRequest = {
  id: string
  eventCreator: string
  eventName: string
  eventDescription: string | null
  timestamp: Date
}

export type DefinedEventResponse = {
  id: string
  eventCreator: string
  eventName: string
  eventDescription: string | null
  createdAt: Date
  updatedAt: Date
}

export type DefinedEventQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof DefinedEventResponse
  orderDirection: string
  eventCreator: string | null
  eventName: string | null
}