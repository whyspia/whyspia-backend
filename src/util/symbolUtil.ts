import type { SymbolDocument } from '../models/symbol.model'
import type { SymbolResponse } from '../types/symbol.types'

export function mapSymbolResponse(
  symbolDoc: any
): SymbolResponse | null {
  if (!symbolDoc) {
    return null
  }

  return {
    id: symbolDoc._id.toString(),
    name: symbolDoc.name,
    currentDefinition: symbolDoc.currentDefinition,
  }
}
