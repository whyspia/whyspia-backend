import type { Response } from 'express'

import { logger } from '../lib/logger'
import { CORRELATION_ID } from '../middleware/correlationId'
import { getCurrentDateTime } from '../middleware/logger'

export const handleError = (res: Response, error: any, message: string) => {
  const correlationId = (res.req.headers[CORRELATION_ID] ?? '') as string
  const cause = findCause(error)

  if (cause.custom) {
    logger.error(
      `${message}. Error: ${cause.message as string}. Stack: ${
        cause.stack as string
      }`
    )
  } else {
    logger.error(`${message}. Cause: ${error.message as string}`)
  }

  const resBody = { id: correlationId, success: false, message, error }
  logResponse({ res, resBody })
  return res.status(500).json(resBody)
}

export const handleSuccess = (res: Response, data: any) => {
  const correlationId = (res.req.headers[CORRELATION_ID] ?? '') as string
  const resBody = {
    id: correlationId,
    success: true,
    data,
  }
  logResponse({ res, resBody })
  return res.status(200).json(resBody)
}

export const handlePagingSuccess = (res: Response, data: any) => {
  const correlationId = (res.req.headers[CORRELATION_ID] ?? '') as string
  const resBody = {
    id: correlationId,
    success: true,
    data: data.docs,
    total: data.total,
  }
  logResponse({ res, resBody })
  return res.status(200).json(resBody)
}

const findCause = (sourceError: any) => {
  let error = sourceError
  while (error.parent && error.custom) {
    error = error.parent
  }

  return error
}

export function logResponse({ res, resBody }: { res: Response; resBody: any }) {
  const correlationId = (res.req.headers[CORRELATION_ID] ?? '') as string
  console.info(
    `${getCurrentDateTime()} :: ${correlationId} :: RETURNED_RESPONSE :: [${
      res.req.method
    }] ${res.req.baseUrl}${res.req.url}, body=${JSON.stringify(
      resBody
    )}\n------------------------------------------`
  )
}
