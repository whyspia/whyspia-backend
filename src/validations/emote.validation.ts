import { body, query } from 'express-validator'

export const createEmoteValidation = [
  // body('senderUserTokenID')
  //   .notEmpty()
  //   .isString()
  //   .withMessage('senderUserTokenID is not valid or null/empty'),
  body('receiverSymbols')
    .notEmpty()
    .isString()
    .withMessage('receiverSymbols is not valid or null/empty'),
  body('sentSymbols')
    .notEmpty()
    .isString()
    .withMessage('sentSymbols is not valid or null/empty'),
]

export const fetchEmoteValidation = [
  query('emoteId')
    .notEmpty()
    .isString()
    .withMessage('emoteId is not valid or null/empty'),
]

export const fetchAllEmotesValidation = [
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

export const updateEmoteValidation = [
  body('emoteId')
    .notEmpty()
    .isString()
    .withMessage('emoteId is not valid or null/empty'),
  body('updatedData')
    .notEmpty()
    .isObject()
    .withMessage('updatedData should be a non-empty object'),
]

export const deleteEmoteValidation = [
  body('emoteId')
    .notEmpty()
    .isString()
    .withMessage('emoteId is not valid or null/empty'),
]
