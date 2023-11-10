import type { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'

export const CORRELATION_ID = 'Correlation-Id'

export function setCorrelationId(req: Request, _: Response, next: () => void) {
  const id = uuidv4().toUpperCase()
  req.headers[CORRELATION_ID] = id
  next()
}
