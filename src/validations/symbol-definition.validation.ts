import { body, header, oneOf, query } from 'express-validator'

export const createSymbolDefinitionValidation = [
  // body('senderUserTokenID')
  //   .notEmpty()
  //   .isString()
  //   .withMessage('senderUserTokenID is not valid or null/empty'),
  body('symbol')
    .notEmpty()
    .isString()
    .withMessage('symbol is not valid or null/empty'),
  body('symbolDefinition')
    .notEmpty()
    .isString()
    .withMessage('symbolDefinition is not valid or null/empty'),
]

export const fetchSymbolDefinitionValidation = [
  // query('symbolDefinitionId')
  //   .notEmpty()
  //   .isString()
  //   .withMessage('symbolDefinitionId is not valid or null/empty'),
]

export const fetchAllSymbolDefinitionsValidation = [
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

export const updateSymbolDefinitionValidation = [
  header('Authorization')
    .notEmpty()
    .withMessage('Authorization header is required'),
  oneOf(
    [
      body('symbolDefinitionId')
        .notEmpty()
        .isString()
        .withMessage('symbolDefinitionId is required'),
      body('symbol')
        .notEmpty()
        .isString()
        .withMessage('symbol is required'),
    ],
    'Either symbolDefinitionId or symbol is mandatory'
  ),
  body('updatedDefinition')
    .notEmpty()
    .isString()
    .withMessage('updatedDefinition should be a non-empty object'),
]

export const deleteSymbolDefinitionValidation = [
  body('symbolDefinitionId')
    .notEmpty()
    .isString()
    .withMessage('symbolDefinitionId is not valid or null/empty'),
]
