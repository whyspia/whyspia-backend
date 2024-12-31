import { body } from 'express-validator'

export const createPlaceValidation = [
  body('placeName')
    .exists()
    .withMessage('placeName is required')
    .isString()
    .withMessage('placeName must be a string'),
  body('visitCount')
    .optional()
    .isNumeric()
    .withMessage('visitCount must be a number')
    .custom((value) => value >= 0)
    .withMessage('visitCount must be greater than or equal to 0')
]