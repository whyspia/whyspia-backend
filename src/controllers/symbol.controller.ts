import type { Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  createSymbolInDB,
  fetchAllSymbolsFromDB,
  // fetchsymbolFromDB,
  // updatesymbolInDB,
  // deletesymbolInDB,
} from '../services/symbol.service'
import type { SymbolRequest, SymbolResponse, SymbolQueryOptions } from '../types/symbol.types'

export async function createSymbol(req: Request, res: Response) {
  try {
    const symbolData = req.body as Partial<SymbolRequest>
    const symbol = await createSymbolInDB(symbolData)
    return handleSuccess(res, { symbol })
  } catch (error) {
    console.error('Error occurred while creating symbol', error)
    return handleError(res, error, 'Unable to create symbol')
  }
}

// Fetch emote Type
// export async function fetchsymbol(req: Request, res: Response) {
//   try {
//     const symbolId = req.query.symbolId as string
//     const symbol = await fetchsymbolFromDB(symbolId)
//     return handleSuccess(res, { symbol })
//   } catch (error) {
//     console.error('Error occurred while fetching emote type', error)
//     return handleError(res, error, 'Unable to fetch emote type')
//   }
// }

export async function fetchAllSymbols(req: Request, res: Response) {
  const skip = Number.parseInt(req.query.skip as string) || 0
  const limit = Number.parseInt(req.query.limit as string) || 10
  const orderBy = req.query.orderBy as keyof SymbolResponse
  const orderDirection =
    (req.query.orderDirection as string | undefined) ?? 'desc'
  const search = (req.query.search as string) || null

  const options: SymbolQueryOptions = {
    skip,
    limit,
    orderBy,
    orderDirection,
    search,
  }

  try {
    const symbols = await fetchAllSymbolsFromDB(options)
    return handleSuccess(res, { symbols })
  } catch (error) {
    console.error('Error occurred while fetching all symbols', error)
    return handleError(res, error, 'Unable to fetch all symbols')
  }
}

// Update emote Type
// export async function updatesymbol(req: Request, res: Response) {
//   try {
//     const symbolId = req.body.symbolId as string
//     const updatedData = req.body.updatedData as Partial<SymbolResponse>
//     const updatedsymbol = await updatesymbolInDB(symbolId, updatedData)
//     return handleSuccess(res, { updatedsymbol })
//   } catch (error) {
//     console.error('Error occurred while updating emote type', error)
//     return handleError(res, error, 'Unable to update emote type')
//   }
// }

// Delete emote Type
// export async function deletesymbol(req: Request, res: Response) {
//   try {
//     const symbolId = req.body.symbolId as string
//     await deletesymbolInDB(symbolId)
//     return handleSuccess(res, { message: `emote type with ID ${symbolId} has been deleted` })
//   } catch (error) {
//     console.error('Error occurred while deleting emote type', error)
//     return handleError(res, error, 'Unable to delete emote type')
//   }
// }
