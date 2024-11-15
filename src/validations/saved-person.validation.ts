import { body, query } from 'express-validator'

export const createSavedPersonValidation = [
  body('primaryWalletSaved').isString().withMessage('primaryWalletSaved must be a string'),
  body('chosenName').isString().withMessage('chosenName must be a string'),
]

export const fetchSavedPersonSingleValidation = [
  query('savedPersonID')
    .notEmpty()
    .isString()
    .withMessage('savedPersonID is not valid or null/empty'),
]

export const fetchAllSavedPersonValidation = [
  query('skip')
    .optional()
    .isInt({ min: 0 })
    .withMessage('skip should be a non-negative integer'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('limit should be a positive integer'),
  query('orderBy')
    .optional()
    .isString()
    .withMessage('orderBy should be a valid string if provided'),
  query('orderDirection')
    .optional()
    .isString()
    .withMessage('orderDirection should be a valid string if provided'),
]

export const updateSavedPersonValidation = [
  body('savedPersonID').notEmpty().isString().withMessage('savedPersonID is not valid or null/empty'),
  body('chosenName').isString().withMessage('chosenName must be a string'),
]

export const deleteSavedPersonValidation = [
  body('savedPersonID').notEmpty().isString().withMessage('savedPersonID is not valid or null/empty'),
]
