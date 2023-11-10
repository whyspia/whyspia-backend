import { body, param, query } from 'express-validator'

export const addCategoryValidation = [
  body('name').notEmpty().isString().withMessage('name cannot be null/empty'),
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('enabled should be either true/false'),
  body('hidden')
    .optional()
    .isBoolean()
    .withMessage('hidden should be either true/false'),
  body('startDate')
    .optional()
    .isDate()
    .withMessage('startDate should be a valid date'),
  body('endDate')
    .optional()
    .isDate()
    .withMessage('endDate should be a valid date'),
]

export const updateCategoryValidation = [
  body('categoryId')
    .notEmpty()
    .isString()
    .withMessage('categoryId cannot be null/empty'),
  body('name').optional().isString().withMessage('name cannot be null/empty'),
  body('enabled')
    .optional()
    .isBoolean()
    .withMessage('enabled should be either true/false'),
  body('hidden')
    .optional()
    .isBoolean()
    .withMessage('hidden should be either true/false'),
  body('startDate')
    .optional()
    .isDate()
    .withMessage('startDate should be a valid date'),
  body('endDate')
    .optional()
    .isDate()
    .withMessage('endDate should be a valid date'),
]

export const fetchCategoriesValidation = [
  query('enabled')
    .optional()
    .isString()
    .isIn(['true', 'false'])
    .withMessage('enabled can either be true/false'),
]

export const fetchCategoryValidation = [
  param('id').notEmpty().isString().withMessage('id cannot be null/empty'),
]
