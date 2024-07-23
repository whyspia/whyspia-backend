import { body, query, oneOf } from 'express-validator'

export const createDefinedEventValidation = [
  body('eventName')
    .notEmpty()
    .isString()
    .withMessage('eventName is not valid or null/empty'),
]

// export const fetchsymbolValidation = [
//   query('symbolId')
//     .notEmpty()
//     .isString()
//     .withMessage('symbolId is not valid or null/empty'),
// ]

export const fetchAllDefinedEventsValidation = [
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
  query('search')
    .optional()
    .isString()
    .withMessage('search should be a valid string if provided'),
]

export const fetchDefinedEventSingleValidation = [
  oneOf([
    query('definedEventId').notEmpty().isString(),
    [
      query('eventName').notEmpty().isString(),
      query('eventCreator').notEmpty().isString()
    ]
  ], 'Either definedEventId or (eventName and eventCreator) must be provided'),
]

export const updateDefinedEventValidation = [
  body('definedEventId')
    .notEmpty()
    .isString()
    .withMessage('definedEventId is not valid or null/empty'),
    oneOf([
      body('updatedEventName')
        .notEmpty()
        .isString()
        .withMessage('updatedEventName should be a valid string'),
      body('updatedEventDescription')
        .notEmpty()
        .isString()
        .withMessage('updatedEventDescription should be a valid string')
    ], 'Either updatedEventName or updatedEventDescription must be provided')
]

export const deleteDefinedEventValidation = [
  body('definedEventId')
    .notEmpty()
    .isString()
    .withMessage('definedEventId is not valid or null/empty'),
]
