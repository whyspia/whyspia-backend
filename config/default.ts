/* eslint-disable import/no-default-export */
import mongoUriBuilder from 'mongo-uri-builder'

const HOUR_SECONDS = 3600
const DAY_SECONDS = 24 * HOUR_SECONDS

const config = {
  client: {
    hostUrl: process.env.CLIENT_HOST_URL ?? 'http://localhost:3000',
    hostDomain: process.env.CLIENT_HOST_DOMAIN ?? 'localhost:3000',
  },
  server: {
    hostUrl: process.env.SERVER_HOST_URL ?? 'http://localhost:3300',
    port: process.env.PORT ? Number.parseInt(process.env.PORT) : 3300,
  },
  mongodb: {
    uri:
      process.env.MONGODB_URI ??
      mongoUriBuilder({
        username: process.env.MONGODB_USERNAME ?? undefined,
        password: process.env.MONGODB_PASSWORD ?? undefined,
        host: process.env.MONGODB_HOST ?? 'localhost',
        port: process.env.MONGODB_PORT
          ? Number.parseInt(process.env.MONGODB_PORT)
          : 27_017,
        database: process.env.MONGODB_DATABASE ?? 'ideamarket',
      }),
  },
  jwt: {
    secretKey: process.env.JWT_SECRET_KEY ?? undefined,
    expiry: process.env.JWT_TOKEN_EXPIRY
      ? Number.parseInt(process.env.JWT_TOKEN_EXPIRY)
      : 30 * DAY_SECONDS,
  },
  auth: {
    twitter: {
      consumerKey: process.env.TWITTER_CONSUMER_KEY ?? '',
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET ?? '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN ?? '',
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET ?? '',
      bearerToken: process.env.TWITTER_BEARER_TOKEN ?? '',
      callbackSuffix: '/twitterVerification',
    },
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY ?? '',
    fromEmail: 'admin@ideamarket.io',
    emailVerificationTemplateId:
      process.env.SENDGRID_EMAIL_VERIFICATION_TEMPLATE_ID ?? '',
  },
}

export default config
