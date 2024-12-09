import { Wallet } from "../models/user-v2.model"

export type UserTokenRequest = {
  id: string
  primaryWallet: string | null
}

export type UserV2TokenPrivateResponse = {
  id: string
  particleUUID: string
  wallets: Wallet[]
  primaryWallet: string
  chosenPublicName: string
}

export type UserV2TokenPublicResponse = {
  primaryWallet: string
  chosenPublicName: string
}

export type UserV2TokenPublicResponseWithDisplayName = {
  primaryWallet: string
  chosenPublicName: string
  // this is subjective field - if user that sent request to fetch this data has this person as SavedPerson, then chosenName will be displayed. Otherwise will be publicChosenName
  calculatedDisplayName: string
  requestingPrimaryWallet: string | null
  isRequestedUserSavedByRequestingUser: boolean
}

export type UserV2TokensQueryOptions = {
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
