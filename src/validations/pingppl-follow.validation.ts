import { body, query } from 'express-validator'

export const createPingpplFollowValidation = [
  body('eventNameFollowed')
    .notEmpty()
    .isString()
    .withMessage('eventNameFollowed is not valid or null/empty'),
  body('eventSender')
    .notEmpty()
    .isString()
    .withMessage('eventSender is not valid or null/empty'),
]

export const fetchAllPingpplFollowsValidation = [
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
  query('eventNameFollowed')
    .optional()
    .isString()
    .withMessage('eventNameFollowed should be a valid string if provided'),
  query('eventSender')
    .optional()
    .isString()
    .withMessage('eventSender should be a valid string if provided'),
  query('followSender')
    .optional()
    .isString()
    .withMessage('followSender should be a valid string if provided'),
]

export const deletePingpplFollowValidation = [
  body('pingpplFollowId')
    .notEmpty()
    .isString()
    .withMessage('pingpplFollowId is not valid or null/empty'),
]
