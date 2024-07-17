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
import { createDefinedEventAndThenSentEvent, createSentEvent, fetchAllSentEvents } from '../controllers/sent-event.controller'
import { createDefinedEventAndThenSentEventValidation, createSentEventValidation, fetchAllSentEventsValidation } from '../validations/sent-event.validation'
import { createPingpplFollowValidation, deletePingpplFollowValidation, fetchAllPingpplFollowsValidation } from '../validations/pingppl-follow.validation'
import { createPingpplFollow, deletePingpplFollow, fetchAllPingpplFollows } from '../controllers/pingppl-follow.controller'

export const pingpplContextRouter = express.Router()

pingpplContextRouter.post(
  '/definedEvent',
  createDefinedEventValidation,
  validateRequest,
  authenticateAndSetAccount,
  createDefinedEvent
)

pingpplContextRouter.get(
  '/definedEvent/single',
  // fetchDefinedEventValidation,
  validateRequest,
  optionalAuthenticateAndSetAccount,
  fetchDefinedEvent
)

pingpplContextRouter.get(
  '/definedEvent',
  fetchAllDefinedEventsValidation,
  validateRequest,
  fetchAllDefinedEvents
)

pingpplContextRouter.put(
  '/definedEvent',
  updateDefinedEventValidation,
  validateRequest,
  authenticateAndSetAccount,
  updateDefinedEvent
)

pingpplContextRouter.delete(
  '/definedEvent',
  deleteDefinedEventValidation,
  validateRequest,
  authenticateAndSetAccount,
  deleteDefinedEvent
)



pingpplContextRouter.post(
  '/sentEvent',
  createSentEventValidation,
  validateRequest,
  authenticateAndSetAccount,
  createSentEvent
)

pingpplContextRouter.post(
  '/defineEventAndSentEvent',
  createDefinedEventAndThenSentEventValidation,
  validateRequest,
  authenticateAndSetAccount,
  createDefinedEventAndThenSentEvent
)

pingpplContextRouter.get(
  '/sentEvent',
  fetchAllSentEventsValidation,
  validateRequest,
  fetchAllSentEvents
)



pingpplContextRouter.post(
  '/pingpplFollow',
  createPingpplFollowValidation,
  validateRequest,
  authenticateAndSetAccount,
  createPingpplFollow
)

pingpplContextRouter.get(
  '/pingpplFollow',
  fetchAllPingpplFollowsValidation,
  validateRequest,
  fetchAllPingpplFollows
)

pingpplContextRouter.delete(
  '/pingpplFollow',
  deletePingpplFollowValidation,
  validateRequest,
  authenticateAndSetAccount,
  deletePingpplFollow
)
