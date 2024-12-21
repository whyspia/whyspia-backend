import express from 'express'
import { createCurrently, deleteCurrently, fetchAllCurrently, fetchCurrently, updateCurrently } from '../controllers/currently.controller'
import { validateRequest } from '../middleware/validateRequest'
import { createCurrentlyValidation, deleteCurrentlyValidation, fetchCurrentlySingleValidation, updateCurrentlyValidation } from '../validations/currently.validation'
import { authenticateAndSetAccount, optionalAuthenticateAndSetAccount } from '../middleware'

export const currentlyRouter = express.Router() as any

currentlyRouter.post(
  '/',
  createCurrentlyValidation,
  validateRequest,
  authenticateAndSetAccount,
  createCurrently
)

currentlyRouter.get(
  '/single',
  fetchCurrentlySingleValidation,
  validateRequest,
  optionalAuthenticateAndSetAccount,
  fetchCurrently
)

currentlyRouter.get(
  '/',
  // fetchAllTAUsValidation,
  validateRequest,
  optionalAuthenticateAndSetAccount,
  fetchAllCurrently
)

currentlyRouter.put(
  '/update',
  updateCurrentlyValidation,
  validateRequest,
  authenticateAndSetAccount,
  updateCurrently
)

currentlyRouter.delete(
  '/',
  deleteCurrentlyValidation,
  validateRequest,
  authenticateAndSetAccount,
  deleteCurrently
)
