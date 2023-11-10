import express from 'express'
import { authenticateAndSetAccount, optionalAuthenticateAndSetAccount } from '../middleware'

import {
  createSymbolDefinition,
  fetchAllSymbolDefinitions,
  fetchSymbolDefinition,
  updateSymbolDefinition,
  deleteSymbolDefinition,
} from '../controllers/symbol-definition.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  createSymbolDefinitionValidation,
  fetchAllSymbolDefinitionsValidation,
  fetchSymbolDefinitionValidation,
  updateSymbolDefinitionValidation,
  deleteSymbolDefinitionValidation,
} from '../validations/symbol-definition.validation'

export const symbolDefinitionRouter = express.Router()

symbolDefinitionRouter.post(
  '/',
  createSymbolDefinitionValidation,
  validateRequest,
  authenticateAndSetAccount,
  createSymbolDefinition
)

symbolDefinitionRouter.get(
  '/single',
  fetchSymbolDefinitionValidation,
  validateRequest,
  optionalAuthenticateAndSetAccount,
  fetchSymbolDefinition
)

symbolDefinitionRouter.get(
  '/',
  fetchAllSymbolDefinitionsValidation,
  validateRequest,
  fetchAllSymbolDefinitions
)

symbolDefinitionRouter.put(
  '/',
  updateSymbolDefinitionValidation,
  validateRequest,
  authenticateAndSetAccount,
  updateSymbolDefinition
)

symbolDefinitionRouter.delete(
  '/',
  deleteSymbolDefinitionValidation,
  validateRequest,
  deleteSymbolDefinition
)
