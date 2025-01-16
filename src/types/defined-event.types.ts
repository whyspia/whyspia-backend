import { SAVED_SYMBOL_TYPES } from "../util/definedEventUtil"
import { UserV2TokenPublicResponse } from "./user-v2.types"

export type DefinedEventRequest = {
  id: string
  eventCreator: string
  eventName: string
  eventDescription: string | null
  timestamp: Date
  savedSymbolTypes?: SAVED_SYMBOL_TYPES[]
}

export type DefinedEventResponse = {
  id: string
  eventCreator: string
  eventCreatorUser: UserV2TokenPublicResponse | null
  eventName: string
  eventDescription: string | null
  savedSymbolTypes?: SAVED_SYMBOL_TYPES[]
  createdAt: Date
  updatedAt: Date
}

export type DefinedEventQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof DefinedEventResponse
  orderDirection: string
  search: string | null
  eventCreator: string | null
  eventName: string | null
  requestingPrimaryWallet: string | null
  savedSymbolTypes?: string[]
}