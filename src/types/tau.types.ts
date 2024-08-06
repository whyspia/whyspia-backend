export type TAURequest = {
  id: string
  senderSymbol: string
  receiverSymbol: string
  additionalMessage: string
}

export type TAUResponse = {
  id: string
  senderSymbol: string
  receiverSymbol: string
  additionalMessage: string
  createdAt: Date
}

export type TAUQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof TAUResponse
  orderDirection: string
  senderSymbol: string | null
  receiverSymbol: string | null
  additionalMessage: string | null
}