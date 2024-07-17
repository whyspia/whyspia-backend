
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
  followSender: string
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
}