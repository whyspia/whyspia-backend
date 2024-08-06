import { body, query, oneOf } from 'express-validator'

export const createTAUValidation = [
  body('receiverSymbol')
    .notEmpty()
    .isString()
    .withMessage('receiverSymbol is not valid or null/empty'),
]

export const fetchTAUSingleValidation = [
  query('tauID')
    .notEmpty()
    .isString()
    .withMessage('tauID is not valid or null/empty'),
]

export const fetchAllTAUsValidation = [
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
  query('senderSymbol')
    .optional()
    .isString()
    .withMessage('senderSymbol should be a valid string if provided'),
  query('receiverSymbol')
    .optional()
    .isString()
    .withMessage('receiverSymbol should be a valid string if provided'),
  query('additionalMessage')
    .optional()
    .isString()
    .withMessage('additionalMessage should be a valid string if provided'),
]

export const deleteTAUValidation = [
  body('tauID')
    .notEmpty()
    .isString()
    .withMessage('tauID is not valid or null/empty'),
]
