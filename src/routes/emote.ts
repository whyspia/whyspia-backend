import express from 'express'
import { authenticateAndSetAccount } from '../middleware'

import {
  createEmote,
  fetchAllEmotes,
  // updateEmote,
  deleteEmote,
  fetchLastUnrespondedReceivedEmotes,
  fetchEmote,
} from '../controllers/emote.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  createEmoteValidation,
  fetchAllEmotesValidation,
  // updateEmoteValidation,
  deleteEmoteValidation,
  fetchEmoteValidation,
} from '../validations/emote.validation'

export const emoteRouter = express.Router()

emoteRouter.post(
  '/',
  createEmoteValidation,
  validateRequest,
  authenticateAndSetAccount,
  createEmote
)

emoteRouter.get(
  '/single',
  fetchEmoteValidation,
  validateRequest,
  fetchEmote
)

emoteRouter.get(
  '/',
  fetchAllEmotesValidation,
  validateRequest,
  fetchAllEmotes
)

emoteRouter.get(
  '/fetchLastUnrespondedReceivedEmotes',
  fetchAllEmotesValidation,
  validateRequest,
  authenticateAndSetAccount,
  fetchLastUnrespondedReceivedEmotes
)

// emoteRouter.put(
//   '/',
//   updateEmoteValidation,
//   validateRequest,
//   updateEmote
// )

emoteRouter.delete(
  '/',
  deleteEmoteValidation,
  validateRequest,
  deleteEmote
)
