import { UserTokenResponse } from "./user-token.types"

export type EmoteRequest = {
  id: string
  senderTwitterUsername: string
  receiverSymbol: string
  symbol: string
  timestamp: Date
}

export type EmoteResponse = {
  id: string
  senderTwitterUsername: string
  receiverSymbol: string
  symbol: string
  timestamp: Date
}

export type EmoteQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof EmoteResponse
  orderDirection: string
  senderTwitterUsername: string | null
  receiverSymbol: string | null
  symbol: string | null
}
