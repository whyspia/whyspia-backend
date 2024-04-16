import express from 'express'
import { authenticateAndSetAccount } from '../middleware'

import {
  createEmote,
  fetchAllEmotes,
  // updateEmote,
  deleteEmote,
  fetchUnrespondedReceivedEmotes,
  fetchEmote,
  createEmotes,
} from '../controllers/emote.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  createEmoteValidation,
  fetchAllEmotesValidation,
  // updateEmoteValidation,
  deleteEmoteValidation,
  fetchEmoteValidation,
  createEmotesManyValidation,
} from '../validations/emote.validation'

export const emoteRouter = express.Router()

emoteRouter.post(
  '/',
  createEmoteValidation,
  validateRequest,
  authenticateAndSetAccount,
  createEmote
)

emoteRouter.post(
  '/many',
  createEmotesManyValidation,
  validateRequest,
  authenticateAndSetAccount,
  createEmotes
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
  '/fetchUnrespondedReceivedEmotes',
  fetchAllEmotesValidation,
  validateRequest,
  authenticateAndSetAccount,
  fetchUnrespondedReceivedEmotes
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
