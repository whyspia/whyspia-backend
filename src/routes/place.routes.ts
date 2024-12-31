import express from 'express'
import { validateRequest } from '../middleware/validateRequest'
import { createPlaceValidation } from '../validations/place.validation'
import { createPlace, fetchPlace, fetchAllPlaces, } from '../controllers/place.controller'

export const placeRouter = express.Router() as any

placeRouter.post(
  '/',
  validateRequest,
  createPlaceValidation,
  createPlace
)

placeRouter.get(
  '/:placeID',
  validateRequest,
  fetchPlace
)

placeRouter.get(
  '/',
  validateRequest,
  fetchAllPlaces
)

// placeRouter.delete(
//   '/:placeID',
//   validateRequest,
//   deletePlace
// )
