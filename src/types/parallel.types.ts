import { UserTokenResponse } from "./user-token.types"

// export type GetActiveUsersRequest = {
//   id: string
//   name: string
// }

export type GetActiveUsersResponse = {
  activeUsers: UserTokenResponse[]
}

export type GetActiveUsersQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof GetActiveUsersResponse
  orderDirection: string
  search: string | null
  context: string | null
}
