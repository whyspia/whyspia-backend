import mongoose from 'mongoose'
import type { FilterQuery } from 'mongoose'

import { DefinedEventModel } from '../models/symbol-definition.model'
import type { DefinedEventDocument } from '../models/symbol-definition.model'
import type { DefinedEventQueryOptions, DefinedEventRequest, DefinedEventResponse } from '../types/symbol-definition.types'
import { InternalServerError } from './errors'
import { mapDefinedEventResponse } from '../util/DefinedEventUtil'
import escapeStringRegexp from 'escape-string-regexp'
import { createSymbolInDB, fetchAllSymbolsFromDB } from './symbol.service'

export async function createDefinedEventInDB(definedEventData: Partial<DefinedEventRequest>): Promise<DefinedEventResponse | null> {
  try {

    // Check if symbol exists
    const symbols = await fetchAllSymbolsFromDB({ search: definedEventData.symbol } as any)
    if (symbols?.length === 0) {
      // Create the symbol if it does not exist
      await createSymbolInDB({ name: definedEventData?.symbol?.toLowerCase() })
    }

    const DefinedEventBuildData = {
      senderTwitterUsername: definedEventData.senderTwitterUsername as string,
      symbol: definedEventData?.symbol?.toLowerCase() as string,
      currentDefinition: definedEventData.DefinedEvent as string,
      pastDefinitions: null
    }
    const DefinedEventDoc = DefinedEventModel.build(DefinedEventBuildData)
    const createdDefinedEvent = await DefinedEventModel.create(DefinedEventDoc)
    return mapDefinedEventResponse(createdDefinedEvent)
  } catch (error) {
    console.error('Error occurred while creating DefinedEvent in DB', error)
    throw new InternalServerError('Failed to create DefinedEvent in DB')
  }
}

// This method fetches one single definition from one single user
export async function fetchDefinedEventFromDB({
  senderTwitterUsername,
  DefinedEventId,
  symbol,
}: {
  senderTwitterUsername: string
  DefinedEventId: string
  symbol: string
}): Promise<DefinedEventResponse | null> {
  try {
    const DefinedEventDoc = await DefinedEventModel.findOne({
      $or: [
        { _id: DefinedEventId && DefinedEventId !== '' ? DefinedEventId : null, },
        { symbol: { $regex: new RegExp("^" + symbol + "$", 'iu') }, }
      ],
      senderTwitterUsername: { $regex: new RegExp("^" + senderTwitterUsername + "$", 'iu') },
    })
    return DefinedEventDoc ? mapDefinedEventResponse(DefinedEventDoc as any) : null
  } catch (error) {
    console.error('Error occurred while fetching DefinedEvent from DB', error)
    throw new InternalServerError('Failed to fetch DefinedEvent from DB')
  }
}

export async function fetchAllDefinedEventsFromDB(
  options: DefinedEventQueryOptions
): Promise<DefinedEventResponse[]> {
  try {

    const { skip, limit, orderBy, senderTwitterUsername, symbol, DefinedEvent } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<DefinedEventDocument>[] = []

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
    if (DefinedEvent) {
      filterOptions.push({
        $or: [
          { currentDefinition: { $regex: new RegExp("^" + DefinedEvent + "$", 'iu') } },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const DefinedEventDocs: DefinedEventDocument[] = await DefinedEventModel
      .find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    return DefinedEventDocs.map((doc) => mapDefinedEventResponse(doc) as DefinedEventResponse)
  } catch (error) {
    console.error('Error occurred while fetching all DefinedEvents from DB', error)
    throw new InternalServerError('Failed to fetch all DefinedEvents from DB')
  }
}

export async function updateDefinedEventInDB(
{
  senderTwitterUsername,
  symbol,
  DefinedEventId,
  updatedDefinition,
  pastDefinitionResponse = null,
}: {
  senderTwitterUsername: string
  symbol: string
  DefinedEventId: string
  updatedDefinition: string
  pastDefinitionResponse?: Partial<DefinedEventResponse> | null
}): Promise<DefinedEventResponse | null> {
  try {
    const DefinedEventResponse = pastDefinitionResponse ? pastDefinitionResponse : await fetchDefinedEventFromDB({ senderTwitterUsername, DefinedEventId, symbol })
    
    if (DefinedEventResponse && DefinedEventResponse.senderTwitterUsername === senderTwitterUsername) {

      // TODO timestamp is createdAt which never changes. This needs to be updatedAt actually
      const newPastDef = { definition: DefinedEventResponse?.currentDefinition, dateCreated: DefinedEventResponse?.timestamp }
      const pastDefinitions = [newPastDef, ...DefinedEventResponse?.pastDefinitions ?? []]

      // const updatedDefinedEventDoc = await DefinedEventModel.findByIdAndUpdate(DefinedEventId, updatedData, { new: true })
      const updatedDefinedEventDoc = await DefinedEventModel.findOneAndUpdate(
        {
          $or: [
            { _id: DefinedEventId && DefinedEventId !== '' ? DefinedEventId : null, },
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
      return updatedDefinedEventDoc ? mapDefinedEventResponse(updatedDefinedEventDoc as any) : null
    } else {
      throw new InternalServerError('You are not authorized to update this symbol definition');
    }
    
  } catch (error) {
    console.error('Error occurred while updating DefinedEvent in DB', error)
    throw new InternalServerError('Failed to update DefinedEvent in DB')
  }
}

export async function deleteDefinedEventInDB(DefinedEventId: string): Promise<void> {
  try {
    await DefinedEventModel.findByIdAndDelete(DefinedEventId)
  } catch (error) {
    console.error('Error occurred while deleting DefinedEvent from DB', error)
    throw new InternalServerError('Failed to delete DefinedEvent from DB')
  }
}
