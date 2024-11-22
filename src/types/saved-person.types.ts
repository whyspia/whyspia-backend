import { UserV2TokenPublicResponse } from "./user-v2.types"

export interface SavedPersonRequest {
  savedBy: string
  primaryWalletSaved: string
  chosenName: string
}

export interface SavedPersonResponse {
  id: string
  savedBy: string
  primaryWalletSaved: string
  primaryWalletSavedUser: UserV2TokenPublicResponse | null
  chosenName: string
  createdAt: Date
}

export interface SavedPersonQueryOptions {
  skip: number
  limit: number
  orderBy: any
  orderDirection: string
  search: string | null
}