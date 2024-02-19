import { body, query } from 'express-validator'

export const createEmoteNotifValidation = [
  body('emoteID')
    .notEmpty()
    .isString()
    .withMessage('emoteID is not valid or null/empty'),
]

export const fetchAllEmoteNotifsValidation = [
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

export const updateEmoteNotifsValidation = [
  body('emoteNotifIDs')
    .notEmpty()
    .isString()
    .withMessage('emoteNotifIDs is not valid or null/empty'),
  body('isCasualOrDirect')
    .notEmpty()
    .isString()
    .withMessage('isCasualOrDirect is not valid or null/empty')
    .isIn(['casual', 'direct'])
    .withMessage('isCasualOrDirect must be either "casual" or "direct"'),
]

// export const deleteEmoteValidation = [
//   body('emoteId')
//     .notEmpty()
//     .isString()
//     .withMessage('emoteId is not valid or null/empty'),
// ]
