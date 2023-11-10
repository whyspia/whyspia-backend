import express from 'express'

import { fetchETHPrice, fetchValidUrl } from '../controllers/general.controller'
import { cacheThisRoute } from '../middleware/cache'
import { validateRequest } from '../middleware/validateRequest'
import { fetchValidUrlValidation } from '../validations/general.validation'

const generalRouter = express.Router()

generalRouter.get(
  '/valid-url',
  fetchValidUrlValidation,
  validateRequest,
  fetchValidUrl
)

// Cache for this route expires in 1 hour. Then, ETH price is updated
generalRouter.get('/eth-price', cacheThisRoute(3600), fetchETHPrice)

export { generalRouter }
