import { query } from 'express-validator'

export const fetchValidUrlValidation = [
  query('url')
    .notEmpty()
    .withMessage('url cannot be empty or null')
    .isString()
    .withMessage('url is not valid'),
]
