import { UserV2TokenPublicResponse } from "./user-v2.types"

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
  eventCreatorUser: UserV2TokenPublicResponse | null
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
  search: string | null
  requestingPrimaryWallet: string
}