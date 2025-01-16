import type { FilterQuery } from 'mongoose'

import { DefinedEventModel } from '../models/defined-event.model'
import type { DefinedEventDocument } from '../models/defined-event.model'
import type { DefinedEventQueryOptions, DefinedEventRequest, DefinedEventResponse } from '../types/defined-event.types'
import { InternalServerError } from './errors'
import { mapDefinedEventResponse, SAVED_SYMBOL_TYPES } from '../util/definedEventUtil'
import { UserV2Model } from '../models/user-v2.model'
import { getMappingListOfWalletToUserToken, getUserTokenWithDisplayName } from './user-v2.service'

export async function createDefinedEventInDB(definedEventData: Partial<DefinedEventRequest>): Promise<DefinedEventResponse | null> {
  try {
    const definedEventBuildData = {
      eventCreator: definedEventData.eventCreator as string,
      eventName: definedEventData?.eventName as string,
      eventDescription: definedEventData?.eventDescription as string || null,
      savedSymbolTypes: definedEventData?.savedSymbolTypes as SAVED_SYMBOL_TYPES[] || []
    }
    const definedEventDoc = DefinedEventModel.build(definedEventBuildData)
    const createdDefinedEvent = await DefinedEventModel.create(definedEventDoc)

    const eventCreatorUserDoc = await UserV2Model.findOne({ primaryWallet: createdDefinedEvent?.eventCreator })
    const eventCreatorUserWithDisplayName = await getUserTokenWithDisplayName(eventCreatorUserDoc, definedEventData.eventCreator as string)

    return mapDefinedEventResponse(createdDefinedEvent, eventCreatorUserWithDisplayName)
  } catch (error) {
    console.error('error occurred while creating DefinedEvent in DB', error)
    throw new InternalServerError('failed to create DefinedEvent in DB')
  }
}

// This method fetches one single defined-event from one single user
export async function fetchDefinedEventFromDB({
  requestingPrimaryWallet,
  eventCreator,
  definedEventId,
  eventName,
}: {
  requestingPrimaryWallet: string
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

    const eventCreatorUserDoc = await UserV2Model.findOne({ primaryWallet: definedEventDoc?.eventCreator })
    const eventCreatorUserWithDisplayName = await getUserTokenWithDisplayName(eventCreatorUserDoc, requestingPrimaryWallet)

    return definedEventDoc ? mapDefinedEventResponse(definedEventDoc as any, eventCreatorUserWithDisplayName) : null
  } catch (error) {
    console.error('error occurred while fetching DefinedEvent from DB', error)
    throw new InternalServerError('failed to fetch DefinedEvent from DB')
  }
}

export async function fetchAllDefinedEventsFromDB(
  options: DefinedEventQueryOptions
): Promise<DefinedEventResponse[]> {
  try {
    const { skip, limit, orderBy, eventCreator, eventName, search, requestingPrimaryWallet, savedSymbolTypes } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<DefinedEventDocument>[] = []

    if (eventCreator) {
      filterOptions.push({
        eventCreator: { $regex: new RegExp("^" + eventCreator + "$", 'iu') }
      })
    }
    if (eventName) {
      filterOptions.push({
        eventName: { $regex: new RegExp("^" + eventName + "$", 'iu') }
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
    if (savedSymbolTypes && savedSymbolTypes.length > 0) {
      filterOptions.push({
        savedSymbolTypes: { 
          $all: savedSymbolTypes
        }
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const definedEventDocs = await DefinedEventModel.aggregate([
      { $match: filterQuery },
      { $lookup: {
          from: 'userv2', // The name of the UserV2 collection
          localField: 'eventCreator', // Field from DefinedEvent
          foreignField: 'primaryWallet', // Field from UserV2 to match against
          as: 'eventCreatorUser' // Output array field
        }
      },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limit }
    ])

    const fieldMapping = {
      eventCreator: 'eventCreatorUser'
    }
    const userWithDisplayNameMap = await getMappingListOfWalletToUserToken(definedEventDocs, fieldMapping, requestingPrimaryWallet as string)

    return definedEventDocs.map(doc => {
      const eventCreatorUser = userWithDisplayNameMap[doc.eventCreator]
      return mapDefinedEventResponse(doc, eventCreatorUser) as DefinedEventResponse
    })
  } catch (error) {
    console.error('error occurred while fetching all DefinedEvents from DB', error)
    throw new InternalServerError('failed to fetch all DefinedEvents from DB')
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

    const eventCreatorUserDoc = await UserV2Model.findOne({ primaryWallet: updatedDefinedEventDoc?.eventCreator })
    const eventCreatorUserWithDisplayName = await getUserTokenWithDisplayName(eventCreatorUserDoc, eventCreator)
    return updatedDefinedEventDoc ? mapDefinedEventResponse(updatedDefinedEventDoc as any, eventCreatorUserWithDisplayName) : null
    
  } catch (error) {
    console.error('error occurred while updating DefinedEvent in DB', error)
    throw new InternalServerError('failed to update DefinedEvent in DB')
  }
}

export async function deleteDefinedEventInDB(definedEventId: string, eventCreator: string): Promise<void> {
  try {
    await DefinedEventModel.findOneAndDelete({
      _id: definedEventId,
      eventCreator: eventCreator
    })
  } catch (error) {
    console.error('error occurred while deleting DefinedEvent from DB', error)
    throw new InternalServerError('failed to delete DefinedEvent from DB')
  }
}
