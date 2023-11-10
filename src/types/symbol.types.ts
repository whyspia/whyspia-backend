export type SymbolRequest = {
  id: string
  name: string
}

export type SymbolResponse = {
  id: string
  name: string
  currentDefinition?: string
}

export type SymbolQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof SymbolResponse
  orderDirection: string
  search: string | null
}
