import { EmoteResponse } from "./emote.types"
import { NOTIF_TYPE } from '../models/emote-notif.model'
import { PingpplFollowResponse } from "./pingppl-follow.types"
import { SentEventResponse } from "./sent-event.types"
import { TAUResponse } from "./tau.types"
import { UserV2TokenPublicResponse } from "./user-v2.types"
import { CurrentlyResponse } from "./currently.types"

export type EmoteNotifRequest = {
  id: string
  notifDataID: string
  notifType: NOTIF_TYPE
  receiverSymbol: string
  hasReadCasually: boolean
  hasReadDirectly: boolean
  initialNotifData: EmoteResponse | PingpplFollowResponse | SentEventResponse | TAUResponse | CurrentlyResponse | null
  createdAt: Date
}

export type EmoteNotifSingleResponse = {
  id: string
  notifData: EmoteResponse | PingpplFollowResponse | SentEventResponse | TAUResponse | CurrentlyResponse | null
  notifType: NOTIF_TYPE
  receiverSymbol: string
  receiverSymbolUser: UserV2TokenPublicResponse | null
  hasReadCasually: boolean
  hasReadDirectly: boolean
  context?: string
  createdAt: Date
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
  notifType: NOTIF_TYPE
}
