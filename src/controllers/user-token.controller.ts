import config from 'config'
import type { CookieOptions, Request, Response } from 'express'

import { handleError, handleSuccess } from '../lib/base'
import {
  fetchAllTwitterUserTokensFromWeb2,
  fetchTwitterUserTokenFromDB,
  initiateTwitterLoginDB,
  completeTwitterLoginDB,
  checkExistingTwitterProfile,
} from '../services/user-token.service'
import type {
  UserTokenResponse,
  UserTokensQueryOptions,
} from '../types/user-token.types'

const CLIENT_HOST_URL = config.get<string>('client.hostUrl')
const CLIENT_HOST_DOMAIN = config.get<string>('client.hostDomain')

// Initiate login of user by generating DB entry containing request token and secret
export async function initiateTwitterLogin(req: Request, res: Response) {
  const returnHere  = req.body.returnHere as string
  try {
    const twitterVerification = await initiateTwitterLoginDB(returnHere)
    return handleSuccess(res, { twitterVerification })
  } catch (error) {
    console.error('Error occurred while initiating twitter login', error)
    return handleError(res, error, 'Unable to initiate twitter login')
  }
}

// Complete login by verifying using data sent from X API
// Once user finishes logging into X, user is redirected to callbackURL defined in X dev console. Callback will be backend endpoint, which then gets called and then backend redirects user to client home page.
export async function completeTwitterLogin(req: Request, res: Response) {

  try {
    const reqParams  = req.query as any

    // if (oauth_token AND oauth_verifier are not in the params, then return to frontend home page immediately)
    if (!reqParams?.oauth_token && !reqParams?.oauth_verifier) {
      res.redirect(CLIENT_HOST_URL)
      return
    }

    const twitterVerification = await completeTwitterLoginDB({
      requestToken: reqParams.oauth_token,
      oAuthVerifier: reqParams.oauth_verifier,
    })

    const cookieOptions = {
      expires: twitterVerification.validUntil,
      httpOnly: false,
      secure: true,
      sameSite: 'none',
    } as CookieOptions

    if (!CLIENT_HOST_URL.includes('localhost')) {
      // for some reason the domain attribute makes cookie not work on localhost
      cookieOptions['domain'] = `.${CLIENT_HOST_DOMAIN}`  // supposed to be domain that cookie is set on
    }

    // this is where auth cookie is named
    res.cookie('tt', twitterVerification.twitterJwt, cookieOptions)

    res.redirect(reqParams?.returnHere)

    // return handleSuccess(res, { twitterVerification })
    return
  } catch (error) {
    console.error('Error occurred while completing twitter verification', error)
    return handleError(res, error, 'Unable to complete twitter verification')
  }
}

// Update User Token Web2 data
// export async function updateTwitterUserToken(req: Request, res: Response) {
//   try {
//     const reqBody = req.body
//     const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

//     const userTokenRequest: Partial<IUserToken> = {
//       walletAddress: decodedAccount.walletAddress.toLowerCase(),
//       name: reqBody.name as string,
//       username: reqBody.username as string,
//       bio: reqBody.bio as string,
//       profilePhoto: reqBody.profilePhoto as string,
//     }
//     const updatedUserToken = await updateUserTokenWeb2ProfileInDB(
//       userTokenRequest
//     )

//     return handleSuccess(res, { userToken: updatedUserToken })
//   } catch (error) {
//     console.error(
//       'Error occurred while updating the user token web2 profile',
//       error
//     )
//     return handleError(
//       res,
//       error,
//       'Unable to update the user token web2 profile'
//     )
//   }
// }

// Fetch User Token
export async function fetchTwitterUserToken(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as
      | UserTokenResponse
      | null
      | undefined
    const twitterUsername = req.query.twitterUsername
      ? (req.query.twitterUsername as string)
      : null
    const twitterUserTokenId = req.query.twitterUserTokenID
      ? (req.query.twitterUserTokenID as string)
      : (decodedAccount?.id as string)

    const userToken = await fetchTwitterUserTokenFromDB({
      twitterUserTokenId,
      twitterUsername,
    })

    return handleSuccess(res, { userToken })
  } catch (error) {
    console.error('Error occurred while fetching twitter user token', error)
    return handleError(res, error, 'Unable to fetch the twitter user token')
  }
}

export async function fetchAllTwitterUserTokens(req: Request, res: Response) {
  try {
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof UserTokenResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const search = (req.query.search as string) || null
    const filterWallets =
      (req.query.filterWallets as string | undefined)?.split(',') ?? []

    const options: UserTokensQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      search,
      filterWallets,
    }

    const userTokens = await fetchAllTwitterUserTokensFromWeb2(options)
    return handleSuccess(res, { userTokens })
  } catch (error) {
    console.error(
      'Error occurred while fetching all the ideamarket posts',
      error
    )
    return handleError(res, error, 'Unable to fetch the ideamarket posts')
  }
}

export async function checkExistingTwitterProfileController(req: Request, res: Response) {
  try {
    const username = req.query.username as string
    const { isExisting, userToken } = await checkExistingTwitterProfile(username)
    return handleSuccess(res, { isExisting, userToken })
  } catch (error) {
    console.error('Error occurred while checking existing twitter profile', error)
    return handleError(res, error, 'Unable to check existing twitter profile')
  }
}
