import type { FilterQuery } from 'mongoose'

import { PingpplFollowModel } from '../models/pingppl-follow.model'
import type { PingpplFollowDocument } from '../models/pingppl-follow.model'
import type { PingpplFollowQueryOptions, PingpplFollowRequest, PingpplFollowResponse } from '../types/pingppl-follow.types'
import { InternalServerError } from './errors'
import { mapPingpplFollowResponse } from '../util/pingpplFollowUtil'
import { createEmoteNotifInDB } from './emote-notif.service'
import { NOTIF_TYPE } from '../models/emote-notif.model'
import { UserV2Model } from '../models/user-v2.model'
import { fetchUserV2TokenPublicFromDB, getUserTokenWithDisplayName, getMappingListOfWalletToUserToken } from './user-v2.service'

export async function createPingpplFollowInDB(pingpplFollowData: Partial<PingpplFollowRequest>): Promise<PingpplFollowResponse | null> {
  try {
    const pingpplFollowBuildData = {
      eventNameFollowed: pingpplFollowData.eventNameFollowed as string,
      eventSender: pingpplFollowData.eventSender as string,
      followSender: pingpplFollowData.followSender as string,
    }
    const pingpplFollowDoc = PingpplFollowModel.build(pingpplFollowBuildData)
    const createdPingpplFollow = await PingpplFollowModel.create(pingpplFollowDoc)

    const eventSenderUserDoc = await UserV2Model.findOne({ primaryWallet: createdPingpplFollow?.eventSender })
    const eventSenderUserWithDisplayName = await getUserTokenWithDisplayName(eventSenderUserDoc, pingpplFollowData.followSender as string)
    const followSenderUserDoc = await UserV2Model.findOne({ primaryWallet: createdPingpplFollow?.followSender })
    const followSenderUserWithDisplayName = await getUserTokenWithDisplayName(followSenderUserDoc, pingpplFollowData.followSender as string)

    await createEmoteNotifInDB({ notifType: NOTIF_TYPE.PINGPPL_FOLLOW, notifDataID: createdPingpplFollow._id.toString(), receiverSymbol: pingpplFollowData.eventSender, initialNotifData: mapPingpplFollowResponse(createdPingpplFollow, eventSenderUserWithDisplayName, followSenderUserWithDisplayName) })

    return mapPingpplFollowResponse(createdPingpplFollow, eventSenderUserWithDisplayName, followSenderUserWithDisplayName)
  } catch (error) {
    console.error('Error occurred while creating PingpplFollow in DB', error)
    throw new InternalServerError('Failed to create PingpplFollow in DB')
  }
}

export async function fetchAllPingpplFollowsFromDB(
  options: PingpplFollowQueryOptions
): Promise<PingpplFollowResponse[]> {
  try {

    const { skip, limit, orderBy, eventNameFollowed, eventSender, followSender, requestingPrimaryWallet } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<PingpplFollowDocument>[] = []

    if (eventNameFollowed) {
      // had to do this, otherwise passed in var can cause issues with special chars
      const escapedEventNameFollowed = eventNameFollowed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special characters

      filterOptions.push({
        $or: [
          { eventNameFollowed: { $regex: new RegExp("^" + escapedEventNameFollowed + "$", 'iu') } },
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

    // const pingpplFollowDocs: PingpplFollowDocument[] = await PingpplFollowModel
    //   .find(filterQuery)
    //   .sort(sortOptions)
    //   .skip(skip)
    //   .limit(limit)

    const pingpplFollowDocs = await PingpplFollowModel.aggregate([
      { $match: filterQuery },
      { $lookup: {
          from: 'userv2', // The name of the UserV2 collection
          localField: 'eventSender', // Field from PingpplFollow
          foreignField: 'primaryWallet', // Field from UserV2 to match against
          as: 'eventSenderUser' // Output array field
        }
      },
      { $lookup: {
          from: 'userv2', // The name of the UserV2 collection
          localField: 'followSender', // Field from PingpplFollow
          foreignField: 'primaryWallet', // Field from UserV2 to match against
          as: 'followSenderUser' // Output array field
        }
      },
      { $sort: sortOptions },
      { $skip: skip },
      { $limit: limit }
    ])

    // Replace the manual loop with the utility function
    const fieldMapping = {
      eventSender: 'eventSenderUser',
      followSender: 'followSenderUser'
    }
    const userWithDisplayNameMap = await getMappingListOfWalletToUserToken(pingpplFollowDocs, fieldMapping, requestingPrimaryWallet as string)

    return pingpplFollowDocs.map(doc => {
      const eventSenderUser = userWithDisplayNameMap[doc.eventSender]
      const followSenderUser = userWithDisplayNameMap[doc.followSender]
      return mapPingpplFollowResponse(doc, eventSenderUser, followSenderUser) as PingpplFollowResponse
    })
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

export async function notifyFollowersOfEvent(
  eventNameFollowed: string,
  eventSender: string,
  notifType: NOTIF_TYPE,
  notifDataID: string,
  initialNotifData: any,
  requestingPrimaryWallet?: string | null,
  batchSize = 100
): Promise<void> {
  try {
    let skip = 0
    let hasMore = true

    // Keep fetching followers in batches until none left
    while (hasMore) {
      const options: PingpplFollowQueryOptions = {
        skip,
        limit: batchSize,
        orderBy: 'createdAt',
        orderDirection: 'desc',
        eventNameFollowed,
        eventSender,
        followSender: null,
        requestingPrimaryWallet: requestingPrimaryWallet ?? null
      }

      const followers = await fetchAllPingpplFollowsFromDB(options)
      
      if (followers.length === 0) {
        hasMore = false
        break
      }

      // Create notifications in parallel for better performance
      await Promise.all(
        followers.map(follow => 
          createEmoteNotifInDB({
            notifType,
            notifDataID,
            receiverSymbol: follow.followSender,
            initialNotifData
          })
        )
      )

      skip += batchSize
      hasMore = followers.length === batchSize
    }
  } catch (error) {
    console.error('Error notifying followers:', error)
    // Optionally throw or handle error
  }
}
