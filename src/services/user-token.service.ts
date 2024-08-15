import config from 'config'
import escapeStringRegexp from 'escape-string-regexp'
import type { FilterQuery } from 'mongoose'
import request from 'request'
import TwitterClient from 'twitter-api-sdk'
import util from 'util'

import { UserTokenModel } from '../models/user-token.model'
import type { UserTokenDocument } from '../models/user-token.model'
import type {
  TwitterLoginCompletion,
  TwitterLoginInitiation,
  TwitterUserTokensQueryOptions,
} from '../types/user-token.types'
import { generateAuthToken } from '../util/jwtTokenUtil'
import { TWITTER_CONSUMER_KEY, twitterOAuth } from '../util/oauthUtil'
import { mapUserTokenResponse } from '../util/userTokenUtil'
import { InternalServerError } from './errors'

const requestPromise = util.promisify(request)

const clientHostUrl = config.get<string>('client.hostUrl')
const backendHostUrl = config.get<string>('server.hostUrl')
const twitterCallbackUrl = `${backendHostUrl}/user-token/completeTwitterLogin`

const twitterBearerToken = config.get<string>('auth.twitter.bearerToken')

export async function initiateTwitterLoginDB(returnHere: string): Promise<TwitterLoginInitiation> {
  // lol i learned u have to encode this entire url or you cant pass custom query params
  const twitterCallbackUrlEncoded = encodeURIComponent(twitterCallbackUrl + `?returnHere=${returnHere}`)

  const requestData = {
    url: `https://api.twitter.com/oauth/request_token?oauth_callback=${twitterCallbackUrlEncoded}`,
    method: 'POST',
  }

  const response = await requestPromise({
    url: requestData.url,
    method: requestData.method,
    form: twitterOAuth.authorize(requestData),
  })

  const { statusCode, body } = response
  if (statusCode !== 200) {
    console.error(
      `Error occurred while fetching request token :: status=${statusCode}, body=${
        body as string
      }`
    )
    throw new InternalServerError('Failed to fetch request token')
  }

  const results = new URLSearchParams(body)
  const requestToken = results.get('oauth_token')
  const requestTokenSecret = results.get('oauth_token_secret')
  const callbackConfirmed = results.get('oauth_callback_confirmed')

  if (!requestToken || !requestTokenSecret) {
    console.error(
      `Error occurred while fetching request token :: status=${statusCode}, body=${
        body as string
      }`
    )
    throw new InternalServerError('Failed to fetch request token')
  }
  if (callbackConfirmed !== 'true') {
    console.error(
      `Error occurred while fetching request token with confirmed callback :: status=${statusCode}, body=${
        body as string
      }`
    )
    throw new InternalServerError(
      'Failed to fetch request token with confirmed callback'
    )
  }

  const twitterUserTokenDoc = UserTokenModel.build({
    requestToken,
    requestTokenSecret,
  })
  await UserTokenModel.create(twitterUserTokenDoc)

  return {
    authorizationUrl: `https://api.twitter.com/oauth/authorize?oauth_token=${requestToken}`,
  }
}

export async function completeTwitterLoginDB({
  requestToken,
  oAuthVerifier,
}: {
  requestToken: string
  oAuthVerifier: string
}): Promise<TwitterLoginCompletion> {
  const twitterUserTokenDoc = await UserTokenModel.findOne({
    requestToken,
  })
  if (!twitterUserTokenDoc) {
    console.error('Twitter Verification Doc not found')
    throw new InternalServerError('Failed to fetch twitter verification doc')
  }

  const requestData = {
    url: `https://api.twitter.com/oauth/access_token?oauth_token=${requestToken}&oauth_verifier=${oAuthVerifier}?oauth_consumer_key=${TWITTER_CONSUMER_KEY}`,
    method: 'POST',
  }
  const response = await requestPromise({
    url: requestData.url,
    method: requestData.method,
    form: twitterOAuth.authorize(requestData),
  })

  const { statusCode, body } = response
  if (statusCode !== 200) {
    console.error(
      `Error occurred while fetching access token :: status=${statusCode}, body=${
        body as string
      }`
    )
    throw new InternalServerError('Failed to fetch access token')
  }

  const results = new URLSearchParams(body)
  const accessToken = results.get('oauth_token')
  const accessTokenSecret = results.get('oauth_token_secret')
  const twitterUserId = results.get('user_id')
  const twitterUsername = results.get('screen_name')

  if (!accessToken || !accessTokenSecret) {
    console.error(
      `Error occurred while fetching access token :: status=${statusCode}, body=${
        body as string
      }`
    )
    throw new InternalServerError('Failed to fetch access token')
  }

  // If this user had previous userToken, delete it
  const previousTwitterUserTokenDoc = await UserTokenModel.findOne({
    twitterUserId,
  })
  if (previousTwitterUserTokenDoc) {
    await UserTokenModel.deleteMany({ twitterUserId })
  }

  // const twitterClient = new TwitterClient(twitterBearerToken)
  // const twitterUserResponse = await twitterClient.users.findMyUser(
  //   // twitterUsername as string,
  //   {
  //     'user.fields': ['profile_image_url'],
  //   }
  // )
  // const twitterProfilePicURL = twitterUserResponse.data?.profile_image_url

  const updatedTwitterUserTokenDoc =
    await UserTokenModel.findOneAndUpdate(
      { _id: twitterUserTokenDoc._id },
      {
        $set: {
          accessToken,
          accessTokenSecret,
          twitterUserId,
          twitterUsername,
          twitterProfilePicURL: '', // TODO
        },
      },
      { new: true }
    )

  const { authToken, validUntil } = generateAuthToken(
    twitterUserTokenDoc._id.toString()
  )
  if (!authToken) {
    throw new InternalServerError('Error occured while generating auth token')
  }

  return {
    twitterJwt: authToken,
    validUntil,
    // userTokenCreated,
    userToken: mapUserTokenResponse(updatedTwitterUserTokenDoc),
  }
}

export async function fetchTwitterUserTokenFromDB({
  twitterUserTokenId,
  twitterUsername,
}: {
  twitterUserTokenId: string | null
  twitterUsername: string | null
}) {
  let userTokenDoc: UserTokenDocument | null = null

  if (twitterUserTokenId) {
    userTokenDoc = await UserTokenModel.findById(twitterUserTokenId)
  } else if (twitterUsername) {
    userTokenDoc = await UserTokenModel.findOne({
      twitterUsername: { $regex: new RegExp(new RegExp("^" + twitterUsername + "$", 'iu'), 'iu') },
    }) // This regexp queries for twitterUsername and disregards case
  } else {
    userTokenDoc = null
  }

  if (!userTokenDoc) {
    return null
  }

  return mapUserTokenResponse(userTokenDoc)
}

export async function fetchAllTwitterUserTokensFromWeb2(
  options: TwitterUserTokensQueryOptions
) {
  try {
    const { skip, limit, orderBy, search, filterWallets } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<UserTokenDocument>[] = []
    if (filterWallets.length > 0) {
      filterOptions.push({ twitterUsername: { $in: filterWallets } })
    }
    if (search) {
      filterOptions.push({
        $or: [
          //{ name: { $regex: escapeStringRegexp(search), $options: 'i' } },
          //{ username: { $regex: escapeStringRegexp(search), $options: 'i' } },
          //{ bio: { $regex: escapeStringRegexp(search), $options: 'i' } },
          {
            twitterUsername: {
              $regex: new RegExp(search, 'i'),
            },
          },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const twitterUserTokens = await UserTokenModel
      .find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    return twitterUserTokens.map((twitterUserToken) =>
      mapUserTokenResponse(twitterUserToken)
    )
  } catch (error) {
    console.error('Error occurred while fetching user tokens', error)
    throw new InternalServerError('Error occurred while fetching user tokens')
  }
}

export async function checkExistingTwitterProfile(username: string): Promise<{ isExisting: boolean, userToken: any }> {

  // does this twitter profile exist
  // const isTwitterProfile = await isExistingTwitterProfile(username)
  // TODO: for now we assume all usernames exist on twitter already since free tier of twitter API cannot access unauth'ed users (cant use that method commented out above)
  const isTwitterProfile = true

  // is this twitter profile in hugz DB
  const userTokenDoc = await UserTokenModel.findOne({ twitterUsername: { $regex: new RegExp("^" + username + "$", 'iu') }, })

  let newUserTokenDoc = null

  // if it exists on Twitter, but is not in hugz DB, then put in hugz DB
  if (isTwitterProfile && !(!!userTokenDoc)) {
    newUserTokenDoc = UserTokenModel.build({
      requestToken: 'RECEIVER-' + username,
      requestTokenSecret: 'RECEIVER-' + username,
      twitterUsername: username,
    })
    await UserTokenModel.create(newUserTokenDoc)
  }

  return { isExisting: (!!userTokenDoc) || (!!newUserTokenDoc), userToken: mapUserTokenResponse((!!userTokenDoc) ? userTokenDoc : newUserTokenDoc) }
}
