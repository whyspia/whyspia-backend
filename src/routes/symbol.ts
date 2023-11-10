import express from 'express'

import {
  createSymbol,
  fetchAllSymbols,
  // fetchsymbol,
  // updatesymbol,
  // deletesymbol,
} from '../controllers/symbol.controller'
import { optionalAuthenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  createSymbolValidation,
  fetchAllSymbolsValidation,
  // fetchsymbolValidation,
  // updatesymbolValidation,
  // deletesymbolValidation,
} from '../validations/symbol.validation'

export const symbolRouter = express.Router()

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