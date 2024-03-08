import { EmoteResponse } from "./emote.types"

export type EmoteNotifRequest = {
  id: string
  emoteID: string
  receiverSymbol: string
  hasReadCasually: boolean
  hasReadDirectly: boolean
  timestamp: Date
}

export type EmoteNotifSingleResponse = {
  id: string
  emoteData: EmoteResponse | null
  receiverSymbol: string
  hasReadCasually: boolean
  hasReadDirectly: boolean
  timestamp: Date
}

export type EmoteNotifResponse = {
  emoteNotifs: EmoteNotifSingleResponse[]
  hasReadCasuallyFalseCount: number
  hasReadDirectlyFalseCount: number
}

export type EmoteNotifQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof EmoteNotifResponse
  orderDirection: string
}
