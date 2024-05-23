import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  fetchActiveUsersFromDB,
} from '../services/parallel.service'
import type { GetActiveUsersResponse, GetActiveUsersQueryOptions } from '../types/parallel.types'

export async function fetchActiveUsers(req: Request, res: Response) {
  const skip = Number.parseInt(req.query.skip as string) || 0
  const limit = Number.parseInt(req.query.limit as string) || 10
  const orderBy = req.query.orderBy as any
  const orderDirection =
    (req.query.orderDirection as string | undefined) ?? 'desc'
  const search = (req.query.search as string) || null
  const context = (req.query.context as string) || null

  const options: GetActiveUsersQueryOptions = {
    skip,
    limit,
    orderBy,
    orderDirection,
    search,
    context
  }

  try {
    const activeUsers = await fetchActiveUsersFromDB(options)
    return handleSuccess(res, { activeUsers })
  } catch (error) {
    console.error('Error occurred while fetching active users in parallel', error)
    return handleError(res, error, 'Unable to fetch active users in parallel')
  }
}