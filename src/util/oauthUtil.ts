import config from 'config'
import crypto from 'crypto'
import OAuth from 'oauth-1.0a'

// Twitter Auth Keys
export const TWITTER_CONSUMER_KEY = config.get<string>('auth.twitter.consumerKey')
const TWITTER_CONSUMER_SECRET = config.get<string>(
  'auth.twitter.consumerSecret'
)
const TWITTER_ACCESS_TOKEN = config.get<string>('auth.twitter.accessToken')
const TWITTER_ACCESS_TOKEN_SECRET = config.get<string>(
  'auth.twitter.accessTokenSecret'
)

export const twitterOAuth = new OAuth({
  consumer: {
    key: TWITTER_CONSUMER_KEY,
    secret: TWITTER_CONSUMER_SECRET,
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64')
  },
})

export const twitterAccessToken = {
  key: TWITTER_ACCESS_TOKEN,
  secret: TWITTER_ACCESS_TOKEN_SECRET,
}
