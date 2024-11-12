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
      // query('twitterUserTokenID')
      //   .notEmpty()
      //   .withMessage('twitterUserTokenID is required'),
    ],
    'Either primaryWallet is mandatory'
  ),
]

export const fetchAllUserTokensValidation = [
  query('orderBy')
    .notEmpty()
    .isString()
    .isIn([
      'twitterUsername',
      'createdAt',
      // 'latestRatingsCount',
    ])
    .withMessage('OrderBy cannot be empty and should be a valid string'),
]

export const checkExistingTwitterProfileValidation = [
  query('username')
    .notEmpty()
    .isString()
    .withMessage('username cannot be empty and should be a valid string'),
]

export const updateUserTokenValidation = [
  body('updatedDisplayName')
    .notEmpty()
    .isString()
    .withMessage('updatedDisplayName cannot be empty and should be a valid string'),
]
