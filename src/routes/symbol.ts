import express from 'express'

import {
  createSymbol,
  fetchAllSymbols,
} from '../controllers/symbol.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  createSymbolValidation,
  fetchAllSymbolsValidation,
} from '../validations/symbol.validation'

export const symbolRouter = express.Router() as any

symbolRouter.post(
  '/',
  createSymbolValidation,
  validateRequest,
  createSymbol
)

// symbolRouter.get(
//   '/single',
//   fetchsymbolValidation,
//   validateRequest,
//   optionalAuthenticateAndSetAccount,
//   fetchsymbol
// )

symbolRouter.get(
  '/',
  fetchAllSymbolsValidation,
  validateRequest,
  fetchAllSymbols
)

// symbolRouter.put(
//   '/',
//   updatesymbolValidation,
//   validateRequest,
//   updatesymbol
// )

// symbolRouter.delete(
//   '/',
//   deletesymbolValidation,
//   validateRequest,
//   deletesymbol
// )