export type UserTokenRequest = {
  id: string
  twitterUsername: string | null
}

export type UserTokenResponse = {
  id: string
  twitterUserId: string | null
  twitterUsername: string | null
}

export type UserTokensQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof UserTokenResponse
  orderDirection: string
  search: string | null
  filterWallets: string[]
}

export type TwitterLoginInitiation = {
  authorizationUrl?: string
}

export type TwitterLoginCompletion = {
  twitterJwt: string
  validUntil: Date
  // userTokenCreated: boolean
  userToken: UserTokenResponse | null
}

export type TwitterUserTokensQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof UserTokenResponse
  orderDirection: string
  search: string | null
  filterWallets: string[]
}
