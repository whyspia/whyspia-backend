import express from 'express'
import { authenticateAndSetAccount } from '../middleware'

import {
  createEmote,
  fetchAllEmotes,
  // fetchEmote,
  // updateEmote,
  deleteEmote,
} from '../controllers/emote.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  createEmoteValidation,
  fetchAllEmotesValidation,
  // fetchEmoteValidation,
  // updateEmoteValidation,
  deleteEmoteValidation,
} from '../validations/emote.validation'

export const emoteRouter = express.Router()

emoteRouter.post(
  '/',
  createEmoteValidation,
  validateRequest,
  authenticateAndSetAccount,
  createEmote
)

// emoteRouter.get(
//   '/single',
//   fetchEmoteValidation,
//   validateRequest,
//   fetchEmote
// )

emoteRouter.get(
  '/',
  fetchAllEmotesValidation,
  validateRequest,
  fetchAllEmotes
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
