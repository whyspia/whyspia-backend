import express from 'express'
import { createSavedPerson, deleteSavedPerson, fetchAllSavedPerson, fetchSavedPerson, updateSavedPerson } from '../controllers/saved-person.controller'
import { validateRequest } from '../middleware/validateRequest'
import { createSavedPersonValidation, deleteSavedPersonValidation, updateSavedPersonValidation } from '../validations/saved-person.validation'
import { authenticateAndSetAccount } from '../middleware'

export const savedPersonRouter = express.Router() as any

savedPersonRouter.post(
  '/',
  createSavedPersonValidation,
  validateRequest,
  authenticateAndSetAccount,
  createSavedPerson
)

savedPersonRouter.get(
  '/single',
  validateRequest,
  authenticateAndSetAccount,
  fetchSavedPerson
)

savedPersonRouter.get(
  '/',
  // fetchAllTAUsValidation,
  validateRequest,
  authenticateAndSetAccount,
  fetchAllSavedPerson
)

savedPersonRouter.put(
  '/update',
  updateSavedPersonValidation,
  validateRequest,
  authenticateAndSetAccount,
  updateSavedPerson
)

savedPersonRouter.delete(
  '/',
  deleteSavedPersonValidation,
  validateRequest,
  authenticateAndSetAccount,
  deleteSavedPerson
)
