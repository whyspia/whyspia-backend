import type { FilterQuery } from 'mongoose'

import { SentEventModel } from '../models/sent-event.model'
import type { SentEventDocument } from '../models/sent-event.model'
import type { SentEventQueryOptions, SentEventRequest, SentEventResponse } from '../types/sent-event.types'
import { InternalServerError } from './errors'
import { mapSentEventResponse } from '../util/sentEventUtil'
import { PingpplFollowQueryOptions } from '../types/pingppl-follow.types'
import { fetchAllPingpplFollowsFromDB } from './pingppl-follow.service'
import { createEmoteNotifInDB } from './emote-notif.service'
import { NOTIF_TYPE } from '../models/emote-notif.model'

export async function createSentEventInDB(sentEventData: Partial<SentEventRequest>): Promise<SentEventResponse | null> {
  try {
    const sentEventBuildData = {
      eventSender: sentEventData.eventSender as string,
      eventName: sentEventData?.eventName as string,
      definedEventID: sentEventData?.definedEventID as string,
    }
    const sentEventDoc = SentEventModel.build(sentEventBuildData)
    const createdSentEvent = await SentEventModel.create(sentEventDoc)

    // find all followSenders from follows table and make notif for each
    const options: PingpplFollowQueryOptions = {
      skip: 0,
      limit: 40,  // TODO: can only have 40 followers to get notified due to this line of code here
      orderBy: 'createdAt',
      orderDirection: 'desc',
      eventNameFollowed: sentEventData?.eventName as string,
      eventSender: sentEventData.eventSender as string,
      followSender: null,
    }
    const pingpplFollows = await fetchAllPingpplFollowsFromDB(options)

    if (pingpplFollows && pingpplFollows?.length > 0) {
      for (const follow of pingpplFollows) {
        // TODO: i think we dont need to await these bc that would cause longer load times on frontend for users...i think not awaiting wont cause any issues
        createEmoteNotifInDB({ notifType: NOTIF_TYPE.PINGPPL_SENTEVENT, notifDataID: createdSentEvent._id.toString(), receiverSymbol: follow.followSender, initialNotifData: mapSentEventResponse(createdSentEvent) })
      }
    }

    return mapSentEventResponse(createdSentEvent)
  } catch (error) {
    console.error('Error occurred while creating SentEvent in DB', error)
    throw new InternalServerError('Failed to create SentEvent in DB')
  }
}

// This method fetches one single sent-event from one single user
export async function fetchSentEventFromDB({
  eventSender,
  sentEventId,
  eventName,
}: {
  eventSender: string
  sentEventId: string
  eventName: string
}): Promise<SentEventResponse | null> {
  try {
    const sentEventDoc = await SentEventModel.findOne({
      $or: [
        { _id: sentEventId && sentEventId !== '' ? sentEventId : null, },
        { eventName: { $regex: new RegExp("^" + eventName + "$", 'iu') }, }
      ],
      eventSender: { $regex: new RegExp("^" + eventSender + "$", 'iu') },
    })
    return sentEventDoc ? mapSentEventResponse(sentEventDoc as any) : null
  } catch (error) {
    console.error('Error occurred while fetching SentEvent from DB', error)
    throw new InternalServerError('Failed to fetch SentEvent from DB')
  }
}

export async function fetchAllSentEventsFromDB(
  options: SentEventQueryOptions
): Promise<SentEventResponse[]> {
  try {

    const { skip, limit, orderBy, eventSender, eventName } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<SentEventDocument>[] = []

    if (eventSender) {
      filterOptions.push({
        $or: [
          { eventSender: { $regex: new RegExp("^" + eventSender + "$", 'iu') } },
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

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    // const sentEventDocs: SentEventDocument[] = await SentEventModel
    //   .find(filterQuery)
    //   .sort(sortOptions)
    //   .skip(skip)
    //   .limit(limit)

    const sentEventDocs = await SentEventModel.aggregate([
      { $match: filterQuery },
      {
        $addFields: {
          convertedDefinedEventID: { $toObjectId: "$definedEventID" } // Convert definedEventID from string to ObjectId
        }
      },
      {
        $lookup: {
          from: 'definedevents', // Assuming the collection name is 'definedevents'
          localField: 'convertedDefinedEventID',
          foreignField: '_id',
          as: 'definedEvent'
        }
      },
      { $unwind: '$definedEvent' },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limit }
    ]) as any
    

    return sentEventDocs?.map((doc: SentEventDocument) => mapSentEventResponse(doc) as SentEventResponse)
  } catch (error) {
    console.error('Error occurred while fetching all SentEvents from DB', error)
    throw new InternalServerError('Failed to fetch all SentEvents from DB')
  }
}

// export async function updateSentEventInDB(
// {
//   eventSender,
//   sentEventId,
//   updatedEventName,
//   updatedEventDescription,
// }: {
//   eventSender: string
//   sentEventId: string
//   updatedEventName: string | null
//   updatedEventDescription: string | null
// }): Promise<SentEventResponse | null> {
//   try {
//     const updateData: Partial<SentEventRequest> = {}

//     if (updatedEventName) {
//       updateData.eventName = updatedEventName
//     }

//     if (updatedEventDescription) {
//       updateData.eventDescription = updatedEventDescription
//     }

//     const updatedSentEventDoc = await SentEventModel.findOneAndUpdate(
//       {
//         $or: [
//           { _id: sentEventId && sentEventId !== '' ? sentEventId : null, },
//         ],
//         eventSender: { $regex: new RegExp("^" + eventSender + "$", 'iu') },
//       },
//       updateData,
//       { new: true }
//     )

//     return updatedSentEventDoc ? mapSentEventResponse(updatedSentEventDoc as any) : null
    
//   } catch (error) {
//     console.error('Error occurred while updating SentEvent in DB', error)
//     throw new InternalServerError('Failed to update SentEvent in DB')
//   }
// }

// export async function deleteSentEventInDB(sentEventId: string, eventSender: string): Promise<void> {
//   try {
//     await SentEventModel.findOneAndDelete({
//       _id: sentEventId,
//       eventSender: eventSender
//     })
//   } catch (error) {
//     console.error('Error occurred while deleting SentEvent from DB', error)
//     throw new InternalServerError('Failed to delete SentEvent from DB')
//   }
// }
