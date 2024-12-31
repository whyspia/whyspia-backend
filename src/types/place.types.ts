
export interface PlaceRequest {
  placeName: string
  visitCount: number
}

export interface PlaceResponse {
  id: string
  placeName: string
  visitCount: number
  createdAt: Date
}

export interface PlaceQueryOptions {
  skip: number
  limit: number
  orderBy: any
  orderDirection: string
  search: string | null
  requestingPrimaryWallet: string
}
