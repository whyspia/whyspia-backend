import { UserV2TokenPublicResponse } from "./user-v2.types"

export type PingpplFollowRequest = {
  id: string
  eventNameFollowed: string
  eventSender: string
  followSender: string
  createdAt: Date
}

export type PingpplFollowResponse = {
  id: string
  eventNameFollowed: string
  eventSender: string
  eventSenderUser: UserV2TokenPublicResponse | null
  followSender: string
  followSenderUser: UserV2TokenPublicResponse | null
  createdAt: Date
}

export type PingpplFollowQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof PingpplFollowResponse
  orderDirection: string
  eventNameFollowed: string | null
  eventSender: string | null
  followSender: string | null
  requestingPrimaryWallet: string | null
}