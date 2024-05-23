import express from 'express'

import {
  fetchActiveUsers,
} from '../controllers/parallel.controller'
import { optionalAuthenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchActiveUsersValidation,
} from '../validations/parallel.validation'

export const parallelRouter = express.Router()

// parallelRouter.post(
//   '/',
//   createSymbolValidation,
//   validateRequest,
//   createSymbol
// )

parallelRouter.get(
  '/getActiveUsers',
  fetchActiveUsersValidation,
  validateRequest,
  optionalAuthenticateAndSetAccount,
  fetchActiveUsers
)
