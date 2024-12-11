import express from 'express'

import { authenticateAndSetAccount, optionalAuthenticateAndSetAccount } from '../middleware/authentication'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchAllUserTokensValidation,
  fetchUserTokenPrivateValidation,
  fetchUserTokenPublicValidation,
  updateUserTokenValidation,
} from '../validations/user-token.validation'
import { completeLogin, fetchAllUserV2Tokens, fetchUserV2TokenPrivate, fetchUserV2TokenPublic, initiateLogin, updateUserToken } from '../controllers/user-v2.controller'

export const userV2TokenRouter = express.Router() as any

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
  optionalAuthenticateAndSetAccount,
  fetchUserV2TokenPublic
)

userV2TokenRouter.get(
  '',
  fetchAllUserTokensValidation,
  validateRequest,
  optionalAuthenticateAndSetAccount,
  fetchAllUserV2Tokens
)

userV2TokenRouter.put(
  '/update-profile',
  updateUserTokenValidation,
  validateRequest,
  authenticateAndSetAccount,
  updateUserToken
)
