import config from 'config'
import type { CookieOptions, Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import { completeLoginDB, fetchUserV2TokenFromDB, initiateLoginDB, updateUserTokenInDB } from '../services/user-v2.service'
import { UserV2TokenResponse } from '../types/user-v2.types'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

const CLIENT_HOST_URL = config.get<string>('client.hostUrl')
const CLIENT_HOST_DOMAIN = config.get<string>('client.hostDomain')

// initiate login of user by generating DB entry containing Particle Network userInfo object which contains Particle UUID and public wallet. Later in completeLogin we check if userInfo in reqBody from frontend matches in DB. Extra security step, but could be faked, so later it's really the signature that matters. We could store userInfo during completeLogin instead and this step just be for creating message to send frontend to sign.
export async function initiateLogin(req: Request, res: Response) {
  const reqBody = req.body
  const requestData = {
    particleUUID: reqBody.particleUUID,
    wallets: reqBody.wallets,
    primaryWallet: reqBody.primaryWallet,
  }

  // TODO: do validation on these 2 inputs

  try {
    const messageToSign = await initiateLoginDB(requestData)
    return handleSuccess(res, { messageToSign })
  } catch (error) {
    console.error('error occurred while initiating login', error)
    return handleError(res, error, 'unable to initiate login')
  }
}

export async function completeLogin(req: Request, res: Response) {

  try {
    const reqBody = req.body

    const userV2Verification = await completeLoginDB({
      signature: reqBody.signature,
      signingAddress: reqBody.signingAddress,
    })

    const cookieOptions: CookieOptions = {
      expires: userV2Verification.validUntil,
      httpOnly: false,
      secure: false,
      sameSite: 'lax',
    }

    if (!CLIENT_HOST_URL.includes('localhost')) {
      // for some reason the domain attribute makes cookie not work on localhost
      cookieOptions['domain'] = `.${CLIENT_HOST_DOMAIN}`  // supposed to be domain that cookie is set on
      cookieOptions['secure'] = true
      cookieOptions['sameSite'] = 'none'
    }

    // this is where auth cookie is named
    res.cookie('tt', userV2Verification.jwt, cookieOptions)

    // res.redirect(reqParams?.returnHere)

    return handleSuccess(res, { userV2Verification })
  } catch (error) {
    console.error('error occurred while completing userv2 verification', error)
    return handleError(res, error, 'unable to complete userv2 verification')
  }
}

// like when changing displayName
export async function updateUserToken(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const userTokenID = decodedAccount?.id as string

    const userTokenRequest = {
      updatedDisplayName: reqBody.updatedDisplayName as string,
      userTokenID,
    }
    const updatedUserToken = await updateUserTokenInDB(
      userTokenRequest
    )

    return handleSuccess(res, { userToken: updatedUserToken })
  } catch (error) {
    console.error(
      'error occurred while updating the user token',
      error
    )
    return handleError(
      res,
      error,
      'unable to update the user token'
    )
  }
}

export async function fetchUserV2Token(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as
      | UserV2TokenResponse
      | null
      | undefined
    // const twitterUsername = req.query.twitterUsername
    //   ? (req.query.twitterUsername as string)
    //   : null
    const userTokenID = req.query.userTokenID
      ? (req.query.twitterUserTokenID as string)
      : (decodedAccount?.id as string)

    const userToken = await fetchUserV2TokenFromDB({
      userTokenID,
      // twitterUsername,
    })

    return handleSuccess(res, { userToken })
  } catch (error) {
    console.error('error occurred while fetching userv2 token', error)
    return handleError(res, error, 'unable to fetch the userv2 token')
  }
}

// export async function fetchAllTwitterUserTokens(req: Request, res: Response) {
//   try {
//     const skip = Number.parseInt(req.query.skip as string) || 0
//     const limit = Number.parseInt(req.query.limit as string) || 10
//     const orderBy = req.query.orderBy as keyof UserTokenResponse
//     const orderDirection =
//       (req.query.orderDirection as string | undefined) ?? 'desc'
//     const search = (req.query.search as string) || null
//     const filterWallets =
//       (req.query.filterWallets as string | undefined)?.split(',') ?? []

//     const options: UserTokensQueryOptions = {
//       skip,
//       limit,
//       orderBy,
//       orderDirection,
//       search,
//       filterWallets,
//     }

//     const userTokens = await fetchAllTwitterUserTokensFromWeb2(options)
//     return handleSuccess(res, { userTokens })
//   } catch (error) {
//     console.error(
//       'Error occurred while fetching all the ideamarket posts',
//       error
//     )
//     return handleError(res, error, 'Unable to fetch the ideamarket posts')
//   }
// }
