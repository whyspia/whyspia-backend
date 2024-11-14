import { UserV2TokenPublicResponse } from "./user-v2.types"

export type TAURequest = {
  id: string
  senderPrimaryWallet: string
  receiverPrimaryWallet: string
  additionalMessage: string
}

export type TAUResponse = {
  id: string
  senderUser: UserV2TokenPublicResponse | null
  receiverUser: UserV2TokenPublicResponse | null
  additionalMessage: string
  createdAt: Date
}

export type TAUQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof TAUResponse
  orderDirection: string
  senderPrimaryWallet: string | null
  receiverPrimaryWallet: string | null
  additionalMessage: string | null
}