import express from 'express'

import {
  fetchAllTwitterUserTokens,
} from '../controllers/user-token.controller'
import { authenticateAndSetAccount, optionalAuthenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchAllUserTokensValidation,
  fetchUserTokenPrivateValidation,
  fetchUserTokenPublicValidation,
  updateUserTokenValidation,
} from '../validations/user-token.validation'
import { completeLogin, fetchUserV2TokenPrivate, fetchUserV2TokenPublic, initiateLogin, updateUserToken } from '../controllers/user-v2.controller'

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

userV2TokenRouter.get(
  '/single-private',
  fetchUserTokenPrivateValidation,
  validateRequest,
  authenticateAndSetAccount,
  fetchUserV2TokenPrivate
)

userV2TokenRouter.get(
  '/single-public',
  fetchUserTokenPublicValidation,
  validateRequest,
  fetchUserV2TokenPublic
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
