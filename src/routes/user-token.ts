import express from 'express'

import {
  completeTwitterLogin,
  fetchAllTwitterUserTokens,
  fetchTwitterUserToken,
  initiateTwitterLogin,
  checkExistingTwitterProfileController,
} from '../controllers/user-token.controller'
import { optionalAuthenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  checkExistingTwitterProfileValidation,
  fetchAllUserTokensValidation,
  fetchUserTokenValidation,
} from '../validations/user-token.validation'

export const userTokenRouter = express.Router()

userTokenRouter.post(
  '/initiateTwitterLogin',
  validateRequest,
  initiateTwitterLogin
)

// Only called by redirection from X
userTokenRouter.get(
  '/completeTwitterLogin',
  validateRequest,
  completeTwitterLogin
)

userTokenRouter.get(
  '/single',
  fetchUserTokenValidation,
  validateRequest,
  optionalAuthenticateAndSetAccount,
  fetchTwitterUserToken
)

userTokenRouter.get(
  '',
  fetchAllUserTokensValidation,
  validateRequest,
  fetchAllTwitterUserTokens
)

userTokenRouter.get(
  '/checkExistingTwitterProfile',
  checkExistingTwitterProfileValidation,
  validateRequest,
  // optionalAuthenticateAndSetAccount,
  checkExistingTwitterProfileController
)
