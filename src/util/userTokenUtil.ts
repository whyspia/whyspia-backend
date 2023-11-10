import type { UserTokenDocument } from '../models/user-token.model'
import type { UserTokenResponse } from '../types/user-token.types'
import config from 'config'
import { Client as TwitterClient } from 'twitter-api-sdk'

const twitterBearerToken = config.get<string>('auth.twitter.bearerToken')

/**
 * @param username - check if this username exists on twitter
 */
export async function isExistingTwitterProfile(username: string) {
  const client = new TwitterClient(twitterBearerToken)
  // const authClient = new auth.OAuth2User({
  //   client_id: process.env.CLIENT_ID,
  //   callback: "http://127.0.0.1:3000/callback",
  //   scopes: ["tweet.read", "users.read", "offline.access"],
  // })

  const userResponse = await client.users.findUserByUsername(username)

  return !Boolean(userResponse.errors)
}

export function mapUserTokenResponse(
  userTokenDoc: UserTokenDocument | null
): UserTokenResponse | null {
  if (!userTokenDoc) {
    return null
  }

  return {
    id: userTokenDoc._id.toString(),
    twitterUserId: userTokenDoc.twitterUserId,
    twitterUsername: userTokenDoc.twitterUsername,
  }
}
