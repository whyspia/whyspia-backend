import config from 'config'
import jwt from 'jsonwebtoken'

import { UserTokenModel } from '../models/user-token.model'
import type { UserTokenResponse } from '../types/user-token.types'

const jwtSecretKey: string = config.get('jwt.secretKey')
const jwtExpiry: number = config.get('jwt.expiry')

export type PAYLOAD = {
  accountId: string
  exp: number
}

type DECODED_PAYLOAD = {
  accountId: string
  iat: number
  exp: number
}

/**
 * Generates the auth token with accountId in the payload
 */
export function generateAuthToken(accountId: string) {
  let authToken = null
  const exp = Math.floor(Date.now() / 1000) + jwtExpiry

  try {
    const payload: PAYLOAD = { accountId, exp }
    authToken = jwt.sign(payload, jwtSecretKey, {
      algorithm: 'HS256',
    })
  } catch (error) {
    console.error('Error occurred while generating the auth token', error)
  }

  const validUntil = new Date(exp * 1000)
  return { authToken, validUntil }
}

/**
 * Verifies whether the auth token is valid or not
 */
export function verifyAuthToken(token: string) {
  try {
    const decodedPayload = jwt.verify(token, jwtSecretKey, {
      algorithms: ['HS256'],
    }) as DECODED_PAYLOAD
    console.info('Decoded payload :', JSON.stringify(decodedPayload))
    return !!decodedPayload.accountId
  } catch (error) {
    console.error('Error occurred while verifying the auth token', error)
    return false
  }
}

/**
 * Decodes the auth token if auth token is valid
 */
export function decodeAuthToken(token: string) {
  try {
    const decodedPayload = jwt.verify(token, jwtSecretKey, {
      algorithms: ['HS256'],
    }) as DECODED_PAYLOAD
    console.info('Decoded payload :', JSON.stringify(decodedPayload))
    return decodedPayload.accountId
  } catch (error) {
    console.error('Error occurred while decoding the auth token', error)
    return null
  }
}

/**
 * Verifies the validity of the twitter auth token and returns the TwitterUserToken
 */
export async function verifyTwitterAuthTokenAndReturnAccount(
  token: string
): Promise<UserTokenResponse | null> {
  try {
    const accountId = decodeAuthToken(token)
    if (!accountId) {
      return null
    }

    const twitterUserToken = await UserTokenModel.findById(accountId)
    if (!twitterUserToken) {
      return null
    }

    return {
      id: twitterUserToken._id,
      twitterUsername: twitterUserToken.twitterUsername || null,
      twitterUserId: twitterUserToken.twitterUserId || null,
    }
  } catch (error) {
    console.error(
      'Error occurred while fetching twitter user token from auth token',
      error
    )
    return null
  }
}

export type DECODED_ACCOUNT = {
  id: string
  twitterUserId: string
  twitterUsername: string
}
