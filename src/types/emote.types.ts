import { UserTokenResponse } from "./user-token.types"

export type EmoteRequest = {
  id: string
  senderTwitterUsername: string
  receiverSymbols: string[]
  symbol: string
  timestamp: Date
}

export type EmoteResponse = {
  id: string
  senderTwitterUsername: string
  receiverSymbols: string[]
  symbol: string
  timestamp: Date
}

export type EmoteQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof EmoteResponse
  orderDirection: string
  senderTwitterUsername: string | null
  receiverSymbols: string[] | null
  symbol: string | null
}
