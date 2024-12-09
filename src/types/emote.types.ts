import { UserV2TokenPublicResponse } from "./user-v2.types"

export type EmoteRequest = {
  id: string
  senderPrimaryWallet: string
  receiverSymbols: string[]
  sentSymbols: string[]
  createdAt: Date
}

export type EmoteResponse = {
  id: string
  senderPrimaryWallet: string
  senderUser: UserV2TokenPublicResponse | null
  receiverSymbols: string[]
  receiverUsers?: UserV2TokenPublicResponse[] | null
  sentSymbols: string[]
  createdAt: Date
  context?: string
}

export type EmoteResponseWithNoUChainPreviews = {
  id: string
  senderPrimaryWallet: string
  senderUser: UserV2TokenPublicResponse | null
  receiverSymbols: string[]
  receiverUsers?: UserV2TokenPublicResponse[] | null
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
  senderPrimaryWallet: string | null
  receiverSymbols: string[] | null
  sentSymbols: string[] | null
  createdAt: string | null
  context: string | null
  requestingPrimaryWallet: string
}

export type EmoteNoUContextQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof EmoteResponse
  orderDirection: string
  senderPrimaryWallet: string | null
  receiverSymbols: string[] | null
  sentSymbols: string[] | null
  fetchSentOrReceived: string
  requestingPrimaryWallet: string
}

export type EmoteNouChainQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof EmoteResponse
  orderDirection: string
}
