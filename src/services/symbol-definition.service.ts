import mongoose from 'mongoose'
import type { FilterQuery } from 'mongoose'

import { SymbolDefinitionModel } from '../models/symbol-definition.model'
import type { SymbolDefinitionDocument } from '../models/symbol-definition.model'
import type { SymbolDefinitionQueryOptions, SymbolDefinitionRequest, SymbolDefinitionResponse } from '../types/symbol-definition.types'
import { InternalServerError } from './errors'
import { mapSymbolDefinitionResponse } from '../util/symbolDefinitionUtil'
import escapeStringRegexp from 'escape-string-regexp'
import { createSymbolInDB, fetchAllSymbolsFromDB } from './symbol.service'

export async function createSymbolDefinitionInDB(symbolDefinitionData: Partial<SymbolDefinitionRequest>): Promise<SymbolDefinitionResponse | null> {
  try {
    const symbolDefinitionResponse = await fetchSymbolDefinitionFromDB({
      senderTwitterUsername: symbolDefinitionData.senderTwitterUsername,
      symbolDefinition: symbolDefinitionData.symbolDefinition,
      symbol: symbolDefinitionData.symbol
    } as any)

    if (symbolDefinitionResponse) {
      // throw new InternalServerError('If definition for this symbol already exists for this person, do not let them use this API. They should use update API')
      const updatedSymbolDefinition = await updateSymbolDefinitionInDB({
        senderTwitterUsername: symbolDefinitionData.senderTwitterUsername,
        symbol: symbolDefinitionData.symbol,
        updatedDefinition: symbolDefinitionData.symbolDefinition,
        pastDefinitionResponse: symbolDefinitionResponse,
      } as any)

      return updatedSymbolDefinition
    }

    // Check if symbol exists
    const symbols = await fetchAllSymbolsFromDB({ search: symbolDefinitionData.symbol } as any)
    if (symbols?.length === 0) {
      // Create the symbol if it does not exist
      await createSymbolInDB({ name: symbolDefinitionData?.symbol?.toLowerCase() })
    }

    const symbolDefinitionBuildData = {
      senderTwitterUsername: symbolDefinitionData.senderTwitterUsername as string,
      symbol: symbolDefinitionData?.symbol?.toLowerCase() as string,
      currentDefinition: symbolDefinitionData.symbolDefinition as string,
      pastDefinitions: null
    }
    const symbolDefinitionDoc = SymbolDefinitionModel.build(symbolDefinitionBuildData)
    const createdSymbolDefinition = await SymbolDefinitionModel.create(symbolDefinitionDoc)
    return mapSymbolDefinitionResponse(createdSymbolDefinition)
  } catch (error) {
    console.error('Error occurred while creating symbolDefinition in DB', error)
    throw new InternalServerError('Failed to create symbolDefinition in DB')
  }
}

// This method fetches one single definition from one single user
export async function fetchSymbolDefinitionFromDB({
  senderTwitterUsername,
  symbolDefinitionId,
  symbol,
}: {
  senderTwitterUsername: string
  symbolDefinitionId: string
  symbol: string
}): Promise<SymbolDefinitionResponse | null> {
  try {
    const symbolDefinitionDoc = await SymbolDefinitionModel.findOne({
      $or: [
        { _id: symbolDefinitionId && symbolDefinitionId !== '' ? symbolDefinitionId : null, },
        { symbol: { $regex: new RegExp("^" + symbol + "$", 'iu') }, }
      ],
      senderTwitterUsername: { $regex: new RegExp("^" + senderTwitterUsername + "$", 'iu') },
    })
    return symbolDefinitionDoc ? mapSymbolDefinitionResponse(symbolDefinitionDoc as any) : null
  } catch (error) {
    console.error('Error occurred while fetching SymbolDefinition from DB', error)
    throw new InternalServerError('Failed to fetch SymbolDefinition from DB')
  }
}

export async function fetchAllSymbolDefinitionsFromDB(
  options: SymbolDefinitionQueryOptions
): Promise<SymbolDefinitionResponse[]> {
  try {

    const { skip, limit, orderBy, senderTwitterUsername, symbol, symbolDefinition } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<SymbolDefinitionDocument>[] = []

    if (senderTwitterUsername) {
      filterOptions.push({
        $or: [
          { senderTwitterUsername: { $regex: new RegExp("^" + senderTwitterUsername + "$", 'iu') } },
        ],
      })
    }
    if (symbol) {
      filterOptions.push({
        $or: [
          { symbol: { $regex: new RegExp("^" + symbol + "$", 'iu') } },
        ],
      })
    }
    if (symbolDefinition) {
      filterOptions.push({
        $or: [
          { currentDefinition: { $regex: new RegExp("^" + symbolDefinition + "$", 'iu') } },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const symbolDefinitionDocs: SymbolDefinitionDocument[] = await SymbolDefinitionModel
      .find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    return symbolDefinitionDocs.map((doc) => mapSymbolDefinitionResponse(doc) as SymbolDefinitionResponse)
  } catch (error) {
    console.error('Error occurred while fetching all symbolDefinitions from DB', error)
    throw new InternalServerError('Failed to fetch all symbolDefinitions from DB')
  }
}

export async function updateSymbolDefinitionInDB(
{
  senderTwitterUsername,
  symbol,
  symbolDefinitionId,
  updatedDefinition,
  pastDefinitionResponse = null,
}: {
  senderTwitterUsername: string
  symbol: string
  symbolDefinitionId: string
  updatedDefinition: string
  pastDefinitionResponse?: Partial<SymbolDefinitionResponse> | null
}): Promise<SymbolDefinitionResponse | null> {
  try {
    const symbolDefinitionResponse = pastDefinitionResponse ? pastDefinitionResponse : await fetchSymbolDefinitionFromDB({ senderTwitterUsername, symbolDefinitionId, symbol })
    
    if (symbolDefinitionResponse && symbolDefinitionResponse.senderTwitterUsername === senderTwitterUsername) {

      // TODO timestamp is createdAt which never changes. This needs to be updatedAt actually
      const newPastDef = { definition: symbolDefinitionResponse?.currentDefinition, dateCreated: symbolDefinitionResponse?.timestamp }
      const pastDefinitions = [newPastDef, ...symbolDefinitionResponse?.pastDefinitions ?? []]

      // const updatedSymbolDefinitionDoc = await SymbolDefinitionModel.findByIdAndUpdate(SymbolDefinitionId, updatedData, { new: true })
      const updatedSymbolDefinitionDoc = await SymbolDefinitionModel.findOneAndUpdate(
        {
          $or: [
            { _id: symbolDefinitionId && symbolDefinitionId !== '' ? symbolDefinitionId : null, },
            { symbol: { $regex: new RegExp("^" + symbol + "$", 'iu') }, }
          ],
          senderTwitterUsername: { $regex: new RegExp("^" + senderTwitterUsername + "$", 'iu') },
        },
        {
          currentDefinition: updatedDefinition,
          pastDefinitions,
        },
        { new: true }
      )
      return updatedSymbolDefinitionDoc ? mapSymbolDefinitionResponse(updatedSymbolDefinitionDoc as any) : null
    } else {
      throw new InternalServerError('You are not authorized to update this symbol definition');
    }
    
  } catch (error) {
    console.error('Error occurred while updating SymbolDefinition in DB', error)
    throw new InternalServerError('Failed to update SymbolDefinition in DB')
  }
}

export async function deleteSymbolDefinitionInDB(symbolDefinitionId: string): Promise<void> {
  try {
    await SymbolDefinitionModel.findByIdAndDelete(symbolDefinitionId)
  } catch (error) {
    console.error('Error occurred while deleting symbolDefinition from DB', error)
    throw new InternalServerError('Failed to delete symbolDefinition from DB')
  }
}
