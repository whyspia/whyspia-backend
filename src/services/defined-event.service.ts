import type { FilterQuery } from 'mongoose'

import { DefinedEventModel } from '../models/defined-event.model'
import type { DefinedEventDocument } from '../models/defined-event.model'
import type { DefinedEventQueryOptions, DefinedEventRequest, DefinedEventResponse } from '../types/defined-event.types'
import { InternalServerError } from './errors'
import { mapDefinedEventResponse } from '../util/definedEventUtil'

export async function createDefinedEventInDB(definedEventData: Partial<DefinedEventRequest>): Promise<DefinedEventResponse | null> {
  try {
    const definedEventBuildData = {
      eventCreator: definedEventData.eventCreator as string,
      eventName: definedEventData?.eventName as string,
      eventDescription: definedEventData?.eventDescription as string || null,
    }
    const definedEventDoc = DefinedEventModel.build(definedEventBuildData)
    const createdDefinedEvent = await DefinedEventModel.create(definedEventDoc)
    return mapDefinedEventResponse(createdDefinedEvent)
  } catch (error) {
    console.error('Error occurred while creating DefinedEvent in DB', error)
    throw new InternalServerError('Failed to create DefinedEvent in DB')
  }
}

// This method fetches one single defined-event from one single user
export async function fetchDefinedEventFromDB({
  eventCreator,
  definedEventId,
  eventName,
}: {
  eventCreator: string
  definedEventId: string
  eventName: string
}): Promise<DefinedEventResponse | null> {
  try {
    const definedEventDoc = await DefinedEventModel.findOne({
      $or: [
        { _id: definedEventId && definedEventId !== '' ? definedEventId : null, },
        {
          $and: [
            { eventName: { $regex: new RegExp("^" + eventName + "$", 'iu') } },
            { eventCreator: { $regex: new RegExp("^" + eventCreator + "$", 'iu') } }
          ]
        }
      ],
    })
    return definedEventDoc ? mapDefinedEventResponse(definedEventDoc as any) : null
  } catch (error) {
    console.error('Error occurred while fetching DefinedEvent from DB', error)
    throw new InternalServerError('Failed to fetch DefinedEvent from DB')
  }
}

export async function fetchAllDefinedEventsFromDB(
  options: DefinedEventQueryOptions
): Promise<DefinedEventResponse[]> {
  try {

    const { skip, limit, orderBy, eventCreator, eventName, search } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<DefinedEventDocument>[] = []

    if (eventCreator) {
      filterOptions.push({
        $or: [
          { eventCreator: { $regex: new RegExp("^" + eventCreator + "$", 'iu') } },
        ],
      })
    }
    if (eventName) {
      filterOptions.push({
        $or: [
          { eventName: { $regex: new RegExp("^" + eventName + "$", 'iu') } },
        ],
      })
    }
    if (search) {
      filterOptions.push({
        $or: [
          { eventName: { $regex: new RegExp(search, 'iu') } },
          { eventDescription: { $regex: new RegExp(search, 'iu') } },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const definedEventDocs: DefinedEventDocument[] = await DefinedEventModel
      .find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    return definedEventDocs.map((doc) => mapDefinedEventResponse(doc) as DefinedEventResponse)
  } catch (error) {
    console.error('Error occurred while fetching all DefinedEvents from DB', error)
    throw new InternalServerError('Failed to fetch all DefinedEvents from DB')
  }
}

export async function updateDefinedEventInDB(
{
  eventCreator,
  definedEventId,
  updatedEventName,
  updatedEventDescription,
}: {
  eventCreator: string
  definedEventId: string
  updatedEventName: string | null
  updatedEventDescription: string | null
}): Promise<DefinedEventResponse | null> {
  try {
    const updateData: Partial<DefinedEventRequest> = {}

    if (updatedEventName) {
      updateData.eventName = updatedEventName
    }

    if (updatedEventDescription) {
      updateData.eventDescription = updatedEventDescription
    }

    const updatedDefinedEventDoc = await DefinedEventModel.findOneAndUpdate(
      {
        $or: [
          { _id: definedEventId && definedEventId !== '' ? definedEventId : null, },
        ],
        eventCreator: { $regex: new RegExp("^" + eventCreator + "$", 'iu') },
      },
      updateData,
      { new: true }
    )

    return updatedDefinedEventDoc ? mapDefinedEventResponse(updatedDefinedEventDoc as any) : null
    
  } catch (error) {
    console.error('Error occurred while updating DefinedEvent in DB', error)
    throw new InternalServerError('Failed to update DefinedEvent in DB')
  }
}

export async function deleteDefinedEventInDB(definedEventId: string, eventCreator: string): Promise<void> {
  try {
    await DefinedEventModel.findOneAndDelete({
      _id: definedEventId,
      eventCreator: eventCreator
    })
  } catch (error) {
    console.error('Error occurred while deleting DefinedEvent from DB', error)
    throw new InternalServerError('Failed to delete DefinedEvent from DB')
  }
}
