import { SymbolModel } from '../models/symbol.model'
import type { SymbolDocument } from '../models/symbol.model'
import type { SymbolRequest, SymbolResponse, SymbolQueryOptions } from '../types/symbol.types'
import { InternalServerError } from './errors'
import { mapSymbolResponse } from '../util/symbolUtil'
import { FilterQuery } from 'mongoose'
import escapeStringRegexp from 'escape-string-regexp'
import { SymbolDefinitionDocument, SymbolDefinitionModel } from '../models/symbol-definition.model'

export async function createSymbolInDB(symbolData: Partial<SymbolRequest>): Promise<SymbolResponse | null> {
  try {
    // Check if symbol exists
    const symbols = await fetchAllSymbolsFromDB({ search: symbolData.name } as any)
    if (symbols.length > 0) {
      throw new InternalServerError('This symbol already exists')
    }

    const symbolDoc = SymbolModel.build({ name: symbolData?.name?.toLowerCase() } as any)
    const createdSymbol = await SymbolModel.create(symbolDoc)
    return mapSymbolResponse(createdSymbol)
  } catch (error) {
    console.error('Error occurred while creating symbol in DB', error)
    throw new InternalServerError('Failed to create symbol in DB')
  }
}

// export async function fetchsymbolFromDB(symbolId: string): Promise<SymbolResponse | null> {
//   try {
//     const symbolDoc = await SymbolModel.findById(symbolId)
//     return symbolDoc ? symbolDoc.toObject() : null
//   } catch (error) {
//     console.error('Error occurred while fetching emote type from DB', error)
//     throw new InternalServerError('Failed to fetch emote type from DB')
//   }
// }

export async function fetchAllSymbolsFromDB(
  options: SymbolQueryOptions
): Promise<SymbolResponse[]> {
  try {
    const { skip, limit, orderBy, search } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    const filterOptions: FilterQuery<SymbolDocument>[] = []

    if (search) {
      filterOptions.push({
        $or: [
          { name: { $regex: new RegExp("^" + search + "$", 'iu') } },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const symbolDocs: SymbolDocument[] = await SymbolModel.find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    const symbolDefinitions: SymbolDefinitionDocument[] = await SymbolDefinitionModel.find({
      symbol: { $in: symbolDocs.map((doc) => doc.name) },
    })
    
    //const symbolDefinitionValues: string[] = symbolDefinitions.map((doc) => doc.currentDefinition)

    const parsedSymbolData = symbolDocs.map((doc) => {
      const symbolDefinition = symbolDefinitions.find((def) => def.symbol === doc.name)
      return {
        ...doc.toObject(),
        currentDefinition: symbolDefinition ? symbolDefinition.currentDefinition : null,
      }
    })

    return parsedSymbolData.map((doc) => mapSymbolResponse(doc) as SymbolResponse)
  } catch (error) {
    console.error('Error occurred while fetching all symbols from DB', error)
    throw new InternalServerError('Failed to fetch all symbols from DB')
  }
}

// export async function updatesymbolInDB(symbolId: string, updatedData: Partial<SymbolResponse>): Promise<SymbolResponse | null> {
//   try {
//     const updatedsymbolDoc = await SymbolModel.findByIdAndUpdate(symbolId, updatedData, { new: true })
//     return updatedsymbolDoc ? updatedsymbolDoc.toObject() : null
//   } catch (error) {
//     console.error('Error occurred while updating emote type in DB', error)
//     throw new InternalServerError('Failed to update emote type in DB')
//   }
// }

// export async function deletesymbolInDB(symbolId: string): Promise<void> {
//   try {
//     await SymbolModel.findByIdAndDelete(symbolId)
//   } catch (error) {
//     console.error('Error occurred while deleting emote type from DB', error)
//     throw new InternalServerError('Failed to delete emote type from DB')
//   }
// }
