export type SymbolDefinitionRequest = {
  id: string
  senderTwitterUsername: string
  symbol: string
  symbolDefinition: string
  timestamp: Date
}

export type SymbolDefinitionResponse = {
  id: string
  senderTwitterUsername: string
  symbol: string
  currentDefinition: string
  pastDefinitions: Array<{ definition: string; dateCreated: Date }> | null
  timestamp: Date
}

export type SymbolDefinitionQueryOptions = {
  skip: number
  limit: number
  orderBy: keyof SymbolDefinitionResponse
  orderDirection: string
  senderTwitterUsername: string | null
  symbol: string | null
  symbolDefinition: string | null
}