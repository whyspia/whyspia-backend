import express from 'express'
import { authenticateAndSetAccount, optionalAuthenticateAndSetAccount } from '../middleware'

import {
  createTAU,
  fetchAllTAUs,
  fetchTAU,
  deleteTAU,
} from '../controllers/tau.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  createTAUValidation,
  fetchAllTAUsValidation,
  fetchTAUSingleValidation,
  deleteTAUValidation,
} from '../validations/tau.validation'

export const tauRouter = express.Router()

tauRouter.post(
  '/',
  createTAUValidation,
  validateRequest,
  authenticateAndSetAccount,
  createTAU
)

tauRouter.get(
  '/single',
  fetchTAUSingleValidation,
  validateRequest,
  authenticateAndSetAccount,
  fetchTAU
)

tauRouter.get(
  '/',
  fetchAllTAUsValidation,
  validateRequest,
  authenticateAndSetAccount,
  fetchAllTAUs
)

tauRouter.delete(
  '/',
  deleteTAUValidation,
  validateRequest,
  authenticateAndSetAccount,
  deleteTAU
)
