import type { SymbolDefinitionDocument } from '../models/symbol-definition.model'
import type { SymbolDefinitionResponse } from '../types/symbol-definition.types'

export function mapSymbolDefinitionResponse(
  symbolDefinitionDoc: SymbolDefinitionDocument | null
): SymbolDefinitionResponse | null {
  if (!symbolDefinitionDoc) {
    return null
  }

  return {
    id: symbolDefinitionDoc._id.toString(),
    senderTwitterUsername: symbolDefinitionDoc.senderTwitterUsername,
    symbol: symbolDefinitionDoc.symbol,
    currentDefinition: symbolDefinitionDoc.currentDefinition,
    pastDefinitions: symbolDefinitionDoc.pastDefinitions,
    timestamp: (symbolDefinitionDoc as any).updatedAt,
  }
}
