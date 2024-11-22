import config from 'config'
import jwt from 'jsonwebtoken'

import { UserV2Model, Wallet } from '../models/user-v2.model'
import { UserV2TokenPrivateResponse } from '../types/user-v2.types'

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
 * Verifies the validity of the auth token and returns the UserToken
 */
export async function verifyAuthTokenAndReturnAccount(
  token: string
): Promise<UserV2TokenPrivateResponse | null> {
  try {
    const accountId = decodeAuthToken(token)
    if (!accountId) {
      return null
    }

    const userToken = await UserV2Model.findById(accountId)
    if (!userToken) {
      return null
    }

    return {
      id: userToken._id,
      particleUUID: userToken.particleUUID,
      wallets: userToken.wallets,
      primaryWallet: userToken?.primaryWallet,
      chosenPublicName: userToken?.chosenPublicName,
    }
  } catch (error) {
    console.error(
      'error occurred while fetching user token from auth token',
      error
    )
    return null
  }
}

export type DECODED_ACCOUNT = {
  id: string
  particleUUID: string
  wallets: Wallet
  primaryWallet: string
  chosenPublicName: string
}
