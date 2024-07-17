import { UserTokenResponse } from "./user-token.types"

export type EmoteRequest = {
  id: string
  senderTwitterUsername: string
  receiverSymbols: string[]
  sentSymbols: string[]
  createdAt: Date
}

export type EmoteResponse = {
  id: string
  senderTwitterUsername: string
  receiverSymbols: string[]
  sentSymbols: string[]
  createdAt: Date
  context?: string
}

export type EmoteResponseWithNoUChainPreviews = {
  id: string
  senderTwitterUsername: string
  receiverSymbols: string[]
  sentSymbols: string[]
  createdAt: Date
  context?: string
  chainPreview: EmoteResponse[]
  totalChainLength: number
}

export type EmoteQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof EmoteResponse
  orderDirection: string
  senderTwitterUsername: string | null
  receiverSymbols: string[] | null
  sentSymbols: string[] | null
  createdAt: string | null
  context: string | null
}

export type EmoteNoUContextQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof EmoteResponse
  orderDirection: string
  senderTwitterUsername: string | null
  receiverSymbols: string[] | null
  sentSymbols: string[] | null
  fetchSentOrReceived: string
}

export type EmoteNouChainQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof EmoteResponse
  orderDirection: string
}
