import type { FilterQuery } from 'mongoose'

import { EmoteModel } from '../models/emote.model'
import { UserTokenModel } from '../models/user-token.model'
import type { UserTokenDocument } from '../models/user-token.model'
import type {
  GetActiveUsersQueryOptions,
} from '../types/parallel.types'
import { mapUserTokenResponse } from '../util/userTokenUtil'
import { InternalServerError } from './errors'

export async function fetchActiveUsersFromDB(
  options: GetActiveUsersQueryOptions
) {
  const { skip, limit, orderBy, search, context } = options
  const orderDirection = options.orderDirection === 'asc' ? 1 : -1

  try {
    // Pipeline to fetch the latest online status and ensure they are online
    const onlineStatusPipeline = [
      {
        $match: {
          receiverSymbols: "parallel",
          sentSymbols: { $in: ["im online", "im offline"] }
        }
      },
      {
        $sort: { _id: -1 }
      },
      {
        $group: {
          _id: "$senderTwitterUsername",
          latestStatus: { $first: "$sentSymbols" }
        }
      },
      {
        $match: {
          latestStatus: "im online"
        }
      }
    ];

    // Execute the online status pipeline to get currently online users
    const onlineUsers = await EmoteModel.aggregate(onlineStatusPipeline as any);

    if (context) {
      // Convert online users to a list of usernames
      const onlineUsernames = onlineUsers.map(user => user._id);

      // Pipeline to fetch the latest context interaction for each online user
      const contextPipeline = [
        {
          $match: {
            senderTwitterUsername: { $in: onlineUsernames },
            receiverSymbols: context,
            sentSymbols: { $in: ["entered", "exited"] }
          }
        },
        {
          $sort: { _id: -1 }
        },
        {
          $group: {
            _id: "$senderTwitterUsername",
            latestInteraction: { $first: "$sentSymbols" }
          }
        },
        {
          $match: {
            latestInteraction: "entered"
          }
        }
      ]

      // Execute the context pipeline to filter by the specified context
      const contextFilteredUsers = await EmoteModel.aggregate(contextPipeline as any);
      return contextFilteredUsers.map(user => user._id); // Return only usernames of online users in the specified context
    }

    // If no context is specified, return all online users
    return onlineUsers.map(user => user._id)



    // // Sorting Options
    // const sortOptions: any = {}
    // sortOptions[orderBy] = orderDirection
    // sortOptions._id = 1

    // // Filter Options
    // const filterOptions: FilterQuery<UserTokenDocument>[] = []
    // // if (filterWallets.length > 0) {
    // //   filterOptions.push({ twitterUsername: { $in: filterWallets } })
    // // }
    // if (search) {
    //   filterOptions.push({
    //     $or: [
    //       //{ name: { $regex: escapeStringRegexp(search), $options: 'i' } },
    //       //{ username: { $regex: escapeStringRegexp(search), $options: 'i' } },
    //       //{ bio: { $regex: escapeStringRegexp(search), $options: 'i' } },
    //       {
    //         twitterUsername: {
    //           $regex: new RegExp(search, 'i'),
    //         },
    //       },
    //     ],
    //   })
    // }

    // // Filter Query
    // let filterQuery = {}
    // if (filterOptions.length > 0) {
    //   filterQuery = { $and: filterOptions }
    // }

    // const twitterUserTokens = await UserTokenModel
    //   .find(filterQuery)
    //   .sort(sortOptions)
    //   .skip(skip)
    //   .limit(limit)

    // return twitterUserTokens.map((twitterUserToken) =>
    //   mapUserTokenResponse(twitterUserToken)
    // )
  } catch (error) {
    console.error('Error occurred while fetching user tokens', error)
    throw new InternalServerError('Error occurred while fetching user tokens')
  }
}
