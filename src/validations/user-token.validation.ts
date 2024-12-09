import { oneOf, query, header, body } from 'express-validator'

export const fetchUserTokenPrivateValidation = [
  header('Authorization')
    .notEmpty()
    .withMessage('Authorization header is required'),
]

export const fetchUserTokenPublicValidation = [
  oneOf(
    [
      query('primaryWallet')
        .notEmpty()
        .withMessage('primaryWallet is required'),
    ],
    'Either primaryWallet is mandatory'
  ),
]

export const fetchAllUserTokensValidation = [
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn([
      'primaryWallet',
      'createdAt',
    ])
    .withMessage('orderBy cannot be empty and should be a valid string'),
]

export const updateUserTokenValidation = [
  body('updatedChosenPublicName')
    .notEmpty()
    .isString()
    .withMessage('updatedChosenPublicName cannot be empty and should be a valid string'),
]
