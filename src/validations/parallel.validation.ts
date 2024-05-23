import { body, query } from 'express-validator'

export const fetchActiveUsersValidation = [
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
  query('createdAt')
    .optional()
    .isString()
    .withMessage('createdAt should be a valid string if provided'),
  query('search')
    .optional()
    .isString()
    .withMessage('search should be a valid string if provided'),
  query('context')
    .optional()
    .isString()
    .withMessage('context should be a valid string if provided'),
]