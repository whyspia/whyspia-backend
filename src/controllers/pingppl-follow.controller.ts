import type { Request, Response } from 'express'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

import { handleError, handleSuccess } from '../lib/base'
import {
  createPingpplFollowInDB,
  deletePingpplFollowInDB,
  fetchAllPingpplFollowsFromDB,
} from '../services/pingppl-follow.service'
import type { PingpplFollowQueryOptions, PingpplFollowResponse } from '../types/pingppl-follow.types'


export async function createPingpplFollow(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const reqBody = req.body
    const requestData = {
      eventNameFollowed: reqBody.eventNameFollowed,
      eventSender: reqBody.eventSender,
      followSender: decodedAccount.twitterUsername,
    }
    const pingpplFollow = await createPingpplFollowInDB(requestData);
  
    return handleSuccess(res, { pingpplFollow })
  } catch (error) {
    console.error('Error occurred while creating PingpplFollow', error)
    return handleError(res, error, 'Unable to create PingpplFollow')
  }
}

export async function fetchAllPingpplFollows(req: Request, res: Response) {
  try {
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof PingpplFollowResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    // const search = (req.query.search as string) || null
    const eventNameFollowed = (req.query.eventNameFollowed as string) || null
    const eventSender = (req.query.eventSender as string) || null
    const followSender = (req.query.followSender as string) || null

    const options: PingpplFollowQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      // search,
      eventNameFollowed,
      eventSender,
      followSender,
    }

    const pingpplFollows = await fetchAllPingpplFollowsFromDB(options)
    return handleSuccess(res, { pingpplFollows })
  } catch (error) {
    console.error('Error occurred while fetching all PingpplFollows', error)
    return handleError(res, error, 'Unable to fetch all PingpplFollows')
  }
}

export async function deletePingpplFollow(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const pingpplFollowId = req.body.pingpplFollowId as string
    await deletePingpplFollowInDB(pingpplFollowId, decodedAccount.twitterUsername)
    return handleSuccess(res, { message: `PingpplFollow with ID ${pingpplFollowId} has been deleted` })
  } catch (error) {
    console.error('Error occurred while deleting PingpplFollow', error)
    return handleError(res, error, 'Unable to delete PingpplFollow')
  }
}
