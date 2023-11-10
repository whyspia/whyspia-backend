import { oneOf, query, header } from 'express-validator'

export const fetchUserTokenValidation = [
  oneOf(
    [
      header('Authorization')
        .notEmpty()
        .withMessage('Authorization header is required'),
      query('twitterUsername')
        .notEmpty()
        .withMessage('twitterUsername is required'),
      query('twitterUserTokenID')
        .notEmpty()
        .withMessage('twitterUserTokenID is required'),
    ],
    'Either twitterUsername or walletAddress is mandatory'
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
