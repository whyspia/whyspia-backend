import { body, query, oneOf } from 'express-validator'

export const createTAUValidation = [
  body('receiverPrimaryWallet')
    .notEmpty()
    .isString()
    .withMessage('receiverPrimaryWallet is not valid or null/empty'),
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
  query('senderPrimaryWallet')
    .optional()
    .isString()
    .withMessage('senderPrimaryWallet should be a valid string if provided'),
  query('receiverPrimaryWallet')
    .optional()
    .isString()
    .withMessage('receiverPrimaryWallet should be a valid string if provided'),
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
