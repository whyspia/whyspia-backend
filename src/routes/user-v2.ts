import express from 'express'

import {
  fetchAllTwitterUserTokens,
  fetchTwitterUserToken,
} from '../controllers/user-token.controller'
import { optionalAuthenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchAllUserTokensValidation,
  fetchUserTokenValidation,
} from '../validations/user-token.validation'
import { completeLogin, initiateLogin } from '../controllers/user-v2.controller'

export const userV2TokenRouter = express.Router()

userV2TokenRouter.post(
  '/initiateLogin',
  validateRequest,
  initiateLogin
)

userV2TokenRouter.post(
  '/completeLogin',
  validateRequest,
  completeLogin
)

// TODO: i dont think we'll need this right? Particle gives it all on frontend. Maybe one day for public-facing profile data?
userV2TokenRouter.get(
  '/single',
  fetchUserTokenValidation,
  validateRequest,
  optionalAuthenticateAndSetAccount,
  fetchTwitterUserToken
)

userV2TokenRouter.get(
  '',
  fetchAllUserTokensValidation,
  validateRequest,
  fetchAllTwitterUserTokens
)
