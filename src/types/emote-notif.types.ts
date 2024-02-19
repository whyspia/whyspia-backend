import { EmoteResponse } from "./emote.types"

export type EmoteNotifRequest = {
  id: string
  emoteID: string
  hasReadCasually: boolean
  hasReadDirectly: boolean
  timestamp: Date
}

export type EmoteNotifResponse = {
  id: string
  emoteData: EmoteResponse
  hasReadCasually: boolean
  hasReadDirectly: boolean
  timestamp: Date
}

export type EmoteNotifQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof EmoteNotifResponse
  orderDirection: string
}
