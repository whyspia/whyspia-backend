import { body, query, oneOf } from 'express-validator'

export const createSentEventValidation = [
  body('eventName')
    .notEmpty()
    .isString()
    .withMessage('eventName is not valid or null/empty'),
  body('definedEventID')
    .notEmpty()
    .isString()
    .withMessage('definedEventID is not valid or null/empty'),
]

export const createDefinedEventAndThenSentEventValidation = [
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

export const fetchAllSentEventsValidation = [
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

// export const updateSentEventValidation = [
//   body('definedEventId')
//     .notEmpty()
//     .isString()
//     .withMessage('definedEventId is not valid or null/empty'),
//     oneOf([
//       body('updatedEventName')
//         .notEmpty()
//         .isString()
//         .withMessage('updatedEventName should be a valid string'),
//       body('updatedEventDescription')
//         .notEmpty()
//         .isString()
//         .withMessage('updatedEventDescription should be a valid string')
//     ], 'Either updatedEventName or updatedEventDescription must be provided')
// ]

// export const deleteSentEventValidation = [
//   body('definedEventId')
//     .notEmpty()
//     .isString()
//     .withMessage('definedEventId is not valid or null/empty'),
// ]
