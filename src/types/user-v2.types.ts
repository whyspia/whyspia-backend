import { Wallet } from "../models/user-v2.model"

export type UserTokenRequest = {
  id: string
  twitterUsername: string | null
}

export type UserV2TokenPrivateResponse = {
  id: string
  particleUUID: string
  wallets: Wallet[]
  primaryWallet: string
  displayName: string
}

export type UserV2TokenPublicResponse = {
  primaryWallet: string
  displayName: string
}

export type UserTokensQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof UserV2TokenPublicResponse
  orderDirection: string
  search: string | null
  filterWallets: string[]
}

export type UserV2LoginInitiation = {
  authorizationUrl?: string
}

export type UserV2LoginCompletion = {
  jwt: string
  validUntil: Date
  userToken: UserV2TokenPrivateResponse | null
}

export type TwitterUserTokensQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof UserV2TokenPublicResponse
  orderDirection: string
  search: string | null
  filterWallets: string[]
}
