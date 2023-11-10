import type { Request, Response } from 'express'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

import { handleError, handleSuccess } from '../lib/base'
import {
  createSymbolDefinitionInDB,
  fetchAllSymbolDefinitionsFromDB,
  fetchSymbolDefinitionFromDB,
  updateSymbolDefinitionInDB,
  deleteSymbolDefinitionInDB,
} from '../services/symbol-definition.service'
import type { SymbolDefinitionQueryOptions, SymbolDefinitionResponse } from '../types/symbol-definition.types'

export async function createSymbolDefinition(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const reqBody = req.body
    const requestData = {
      senderTwitterUsername: decodedAccount.twitterUsername,
      symbol: reqBody.symbol,
      symbolDefinition: reqBody.symbolDefinition,
    }
    const symbolDefinition = await createSymbolDefinitionInDB(requestData)
    return handleSuccess(res, { symbolDefinition })
  } catch (error) {
    console.error('Error occurred while creating symbolDefinition', error)
    return handleError(res, error, 'Unable to create symbolDefinition')
  }
}

export async function fetchSymbolDefinition(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const twitterUsername = req.query.twitterUsername
      ? (req.query.twitterUsername as string)
      : null
    const senderTwitterUsername = twitterUsername
      ? (twitterUsername as string)
      : (decodedAccount?.twitterUsername as string)
    const symbolDefinitionId = req.query.symbolDefinitionId as string
    const symbol = req.query.symbol as string
    const symbolDefinition = await fetchSymbolDefinitionFromDB({
      senderTwitterUsername,
      symbolDefinitionId,
      symbol,
    })
    return handleSuccess(res, { symbolDefinition })
  } catch (error) {
    console.error('Error occurred while fetching symbolDefinition', error)
    return handleError(res, error, 'Unable to fetch symbolDefinition')
  }
}

export async function fetchAllSymbolDefinitions(req: Request, res: Response) {
  try {
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof SymbolDefinitionResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    // const search = (req.query.search as string) || null
    const senderTwitterUsername = (req.query.senderTwitterUsername as string) || null
    const symbol = (req.query.symbol as string) || null
    const symbolDefinition = (req.query.symbolDefinition as string) || null

    const options: SymbolDefinitionQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      // search,
      senderTwitterUsername,
      symbol,
      symbolDefinition
    }

    const symbolDefinitions = await fetchAllSymbolDefinitionsFromDB(options)
    return handleSuccess(res, { symbolDefinitions })
  } catch (error) {
    console.error('Error occurred while fetching all symbolDefinitions', error)
    return handleError(res, error, 'Unable to fetch all symbolDefinitions')
  }
}

export async function updateSymbolDefinition(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const symbol = req.body.symbol as string
    const symbolDefinitionId = req.body.symbolDefinitionId as string
    const updatedDefinition = req.body.updatedDefinition as string
    const updatedSymbolDefinition = await updateSymbolDefinitionInDB({
      senderTwitterUsername: decodedAccount.twitterUsername,
      symbol,
      symbolDefinitionId,
      updatedDefinition
    })
    return handleSuccess(res, { updatedSymbolDefinition })
  } catch (error) {
    console.error('Error occurred while updating symbolDefinition', error)
    return handleError(res, error, 'Unable to update symbolDefinition')
  }
}

export async function deleteSymbolDefinition(req: Request, res: Response) {
  try {
    const symbolDefinitionId = req.body.symbolDefinitionId as string
    await deleteSymbolDefinitionInDB(symbolDefinitionId)
    return handleSuccess(res, { message: `SymbolDefinition with ID ${symbolDefinitionId} has been deleted` })
  } catch (error) {
    console.error('Error occurred while deleting symbolDefinition', error)
    return handleError(res, error, 'Unable to delete symbolDefinition')
  }
}
