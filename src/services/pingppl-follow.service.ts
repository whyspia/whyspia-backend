import type { FilterQuery } from 'mongoose'

import { PingpplFollowModel } from '../models/pingppl-follow.model'
import type { PingpplFollowDocument } from '../models/pingppl-follow.model'
import type { PingpplFollowQueryOptions, PingpplFollowRequest, PingpplFollowResponse } from '../types/pingppl-follow.types'
import { InternalServerError } from './errors'
import { mapPingpplFollowResponse } from '../util/pingpplFollowUtil'
import { createEmoteNotifInDB } from './emote-notif.service'
import { NOTIF_TYPE } from '../models/emote-notif.model'

export async function createPingpplFollowInDB(pingpplFollowData: Partial<PingpplFollowRequest>): Promise<PingpplFollowResponse | null> {
  try {
    const pingpplFollowBuildData = {
      eventNameFollowed: pingpplFollowData.eventNameFollowed as string,
      eventSender: pingpplFollowData.eventSender as string,
      followSender: pingpplFollowData.followSender as string,
    }
    const pingpplFollowDoc = PingpplFollowModel.build(pingpplFollowBuildData)
    const createdPingpplFollow = await PingpplFollowModel.create(pingpplFollowDoc)

    await createEmoteNotifInDB({ notifType: NOTIF_TYPE.PINGPPL_FOLLOW, notifDataID: createdPingpplFollow._id.toString(), receiverSymbol: pingpplFollowData.eventSender, initialNotifData: mapPingpplFollowResponse(createdPingpplFollow) })

    return mapPingpplFollowResponse(createdPingpplFollow)
  } catch (error) {
    console.error('Error occurred while creating PingpplFollow in DB', error)
    throw new InternalServerError('Failed to create PingpplFollow in DB')
  }
}

export async function fetchAllPingpplFollowsFromDB(
  options: PingpplFollowQueryOptions
): Promise<PingpplFollowResponse[]> {
  try {

    const { skip, limit, orderBy, eventNameFollowed, eventSender, followSender } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<PingpplFollowDocument>[] = []

    if (eventNameFollowed) {
      filterOptions.push({
        $or: [
          { eventNameFollowed: { $regex: new RegExp("^" + eventNameFollowed + "$", 'iu') } },
        ],
      })
    }
    if (eventSender) {
      filterOptions.push({
        $or: [
          { eventSender: { $regex: new RegExp("^" + eventSender + "$", 'iu') } },
        ],
      })
    }
    if (followSender) {
      filterOptions.push({
        $or: [
          { followSender: { $regex: new RegExp("^" + followSender + "$", 'iu') } },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const pingpplFollowDocs: PingpplFollowDocument[] = await PingpplFollowModel
      .find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    return pingpplFollowDocs.map((doc) => mapPingpplFollowResponse(doc) as PingpplFollowResponse)
  } catch (error) {
    console.error('Error occurred while fetching all PingpplFollows from DB', error)
    throw new InternalServerError('Failed to fetch all PingpplFollows from DB')
  }
}

export async function deletePingpplFollowInDB(pingpplFollowId: string, followSender: string): Promise<void> {
  try {
    await PingpplFollowModel.findOneAndDelete({
      _id: pingpplFollowId,
      followSender,
    })
  } catch (error) {
    console.error('Error occurred while deleting PingpplFollow from DB', error)
    throw new InternalServerError('Failed to delete PingpplFollow from DB')
  }
}
