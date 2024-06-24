import express from 'express'
import { authenticateAndSetAccount, optionalAuthenticateAndSetAccount } from '../middleware'

import {
  createDefinedEvent,
  fetchAllDefinedEvents,
  fetchDefinedEvent,
  updateDefinedEvent,
  deleteDefinedEvent,
} from '../controllers/defined-event.controller'
import { validateRequest } from '../middleware/validateRequest'
import {
  createDefinedEventValidation,
  fetchAllDefinedEventsValidation,
  // fetchDefinedEventValidation,
  updateDefinedEventValidation,
  deleteDefinedEventValidation,
} from '../validations/defined-event.validation'

export const pingpplContextRouter = express.Router()

pingpplContextRouter.post(
  '/',
  createDefinedEventValidation,
  validateRequest,
  authenticateAndSetAccount,
  createDefinedEvent
)

pingpplContextRouter.get(
  '/single',
  // fetchDefinedEventValidation,
  validateRequest,
  optionalAuthenticateAndSetAccount,
  fetchDefinedEvent
)

pingpplContextRouter.get(
  '/',
  fetchAllDefinedEventsValidation,
  validateRequest,
  fetchAllDefinedEvents
)

pingpplContextRouter.put(
  '/',
  updateDefinedEventValidation,
  validateRequest,
  authenticateAndSetAccount,
  updateDefinedEvent
)

pingpplContextRouter.delete(
  '/',
  deleteDefinedEventValidation,
  validateRequest,
  authenticateAndSetAccount,
  deleteDefinedEvent
)
