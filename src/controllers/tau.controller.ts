import type { Request, Response } from 'express'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

import { handleError, handleSuccess } from '../lib/base'
import {
  createTAUInDB,
  fetchAllTAUsFromDB,
  fetchTAUFromDB,
  deleteTAUInDB,
} from '../services/tau.service'
import type { TAUQueryOptions, TAUResponse } from '../types/tau.types'

export async function createTAU(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const reqBody = req.body
    const requestData = {
      senderSymbol: decodedAccount.twitterUsername,
      receiverSymbol: reqBody.receiverSymbol,
      additionalMessage: reqBody.additionalMessage ?? '',
    }
    const tau = await createTAUInDB(requestData)
    return handleSuccess(res, { tau })
  } catch (error) {
    console.error('Error occurred while creating tau', error)
    return handleError(res, error, 'Unable to create tau')
  }
}

export async function fetchTAU(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const tauID = req.query.tauID as string
    const tau = await fetchTAUFromDB({
      tauID,
      senderSymbol: decodedAccount?.twitterUsername,
    })
    return handleSuccess(res, { tau })
  } catch (error) {
    console.error('Error occurred while fetching tau', error)
    return handleError(res, error, 'Unable to fetch tau')
  }
}

export async function fetchAllTAUs(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof TAUResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const senderSymbol = (req.query.senderSymbol as string) || null
    const receiverSymbol = (req.query.receiverSymbol as string) || null
    const additionalMessage = (req.query.additionalMessage as string) || null

    // you gotta either be the sender or the receiver to fetch TAUs
    if (decodedAccount.twitterUsername !== senderSymbol && decodedAccount.twitterUsername !== receiverSymbol) {
      return handleError(res, new Error('unauthorized access to fetch all taus'), 'unauthorized')
    }

    const options: TAUQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      senderSymbol,
      receiverSymbol,
      additionalMessage,
    }

    const taus = await fetchAllTAUsFromDB(options)
    return handleSuccess(res, { taus })
  } catch (error) {
    console.error('error occurred while fetching all taus', error)
    return handleError(res, error, 'unable to fetch all taus')
  }
}

export async function deleteTAU(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const tauID = req.body.tauID as string

    // Fetch the TAU to check the sender
    const tau = await fetchTAUFromDB({ tauID, senderSymbol: decodedAccount.twitterUsername })

    if (!tau) {
      return handleError(res, new Error('TAU not found or you are not authorized to delete it'), 'Unable to delete tau')
    }

    await deleteTAUInDB(tauID, decodedAccount.twitterUsername)
    return handleSuccess(res, { message: `TAU with ID ${tauID} has been deleted` })
  } catch (error) {
    console.error('Error occurred while deleting tau', error)
    return handleError(res, error, 'Unable to delete tau')
  }
}
