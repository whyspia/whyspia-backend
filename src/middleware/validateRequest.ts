import type { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

/**
 * Checks if request has any validation errors and if it does,
 * then replies with error response and list of errors
 */
export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    // no validation errors found, continuing
    next()
    return
  }

  const extractedErrors: { [key: string]: any } = []
  for (const err of errors.array()) {
    extractedErrors.push({ [err.param]: err.msg })
  }

  return res.status(400).json({ errors: extractedErrors })
}
