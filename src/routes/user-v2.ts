import express from 'express'

import {
  fetchAllTwitterUserTokens,
} from '../controllers/user-token.controller'
import { authenticateAndSetAccount, optionalAuthenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchAllUserTokensValidation,
  fetchUserTokenValidation,
  updateUserTokenValidation,
} from '../validations/user-token.validation'
import { completeLogin, fetchUserV2Token, initiateLogin, updateUserToken } from '../controllers/user-v2.controller'

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

// TODO: i think i need another route just like this except only for public data - this has some non-public data
userV2TokenRouter.get(
  '/single',
  fetchUserTokenValidation,
  validateRequest,
  authenticateAndSetAccount,
  fetchUserV2Token
)

userV2TokenRouter.get(
  '',
  fetchAllUserTokensValidation,
  validateRequest,
  fetchAllTwitterUserTokens
)

userV2TokenRouter.put(
  '/update-profile',
  updateUserTokenValidation,
  validateRequest,
  authenticateAndSetAccount,
  updateUserToken
)
