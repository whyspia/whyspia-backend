import express from 'express'
import { authenticateAndSetAccount } from '../middleware'

import {
  fetchAllEmoteNotifs,
  updateEmoteNotif,
} from '../controllers/emote-notif.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  fetchAllEmoteNotifsValidation,
  updateEmoteNotifsValidation,
} from '../validations/emote-notif.validation'

export const emoteNotifRouter = express.Router()

emoteNotifRouter.get(
  '/',
  fetchAllEmoteNotifsValidation,
  validateRequest,
  authenticateAndSetAccount,
  fetchAllEmoteNotifs
)

emoteNotifRouter.put(
  '/',
  updateEmoteNotifsValidation,
  validateRequest,
  authenticateAndSetAccount,
  updateEmoteNotif
)

