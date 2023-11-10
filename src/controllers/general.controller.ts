import type { Request, Response } from 'express'

import { handleSuccess, handleError } from '../lib/base'
import {
  checkAndReturnValidUrl,
  getETHPriceFromExternal,
} from '../services/general.service'
import { normalize } from '../util'

export async function fetchETHPrice(req: Request, res: Response) {
  try {
    return handleSuccess(res, { price: await getETHPriceFromExternal() })
  } catch (error) {
    return handleError(res, error, 'Unable to fetch ETH price')
  }
}

export async function fetchValidUrl(req: Request, res: Response) {
  try {
    const url = decodeURI(req.query.url as string)
    const validUrl = await checkAndReturnValidUrl(normalize(url))

    return handleSuccess(res, {
      validUrl: validUrl ? decodeURI(validUrl) : null,
    })
  } catch (error) {
    console.error('Error occurred while fetching valid url', error)
    return handleError(res, error, 'Unable to fetch valid URL')
  }
}
