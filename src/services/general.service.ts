/* eslint-disable @typescript-eslint/restrict-template-expressions */
import axios from 'axios'
import cheerio from 'cheerio'
import config from 'config'
import Client from 'twitter-api-sdk'

const twitterBearerToken = config.get<string>('auth.twitter.bearerToken')

async function checkTwitterUrl(url: string) {
  const client = new Client(twitterBearerToken)

  const urlObject = new URL(url)
  const pathArray = urlObject.pathname.split('/').filter((item) => item !== '')

  if (pathArray.length === 0) {
    return url
  }

  const [username] = pathArray
  const userResponse = await client.users.findUserByUsername(username)

  if (pathArray.length === 1) {
    return userResponse.errors
      ? null
      : `https://twitter.com/${userResponse.data?.username ?? username}`
  }

  const tweetId = pathArray[pathArray.length - 1]
  const tweetResponse = await client.tweets.findTweetById(tweetId)
  return tweetResponse.errors
    ? null
    : `https://twitter.com/${
        userResponse.data?.username ?? username
      }/status/${tweetId}`
}

/**
 * Checks if url is valid.
 * - If so, it returns the canonical url (if present), else returns original url
 * - If not, return null
 *
 * @param url
 */
export async function checkAndReturnValidUrl(url: string) {
  const urlObject = new URL(url)
  if (urlObject.hostname.endsWith('twitter.com')) {
    try {
      return await checkTwitterUrl(url)
    } catch (error) {
      console.error('Error occurred while validating twitter url', error)
      return null
    }
  }

  let res: any = null
  try {
    res = await axios.get(encodeURI(url), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.80 Safari/537.36',
      },
    })
  } catch (error: any) {
    console.error(
      `Error occurred with status code - ${error.response?.status} while fetching url`
    )
    return null
  }

  try {
    const html = cheerio.load(res.data)
    const canonicalUrl = html('link[rel="canonical"]').attr('href')

    return canonicalUrl ?? url
  } catch (error) {
    console.error('Error occurred while fetching canonical url', error)
    return url
  }
}

/**
 * Get current ETH price using Etherscan API
 */
export const getETHPriceFromExternal = async () => {
  try {
    const params = {
      module: 'stats',
      action: 'ethprice',
      apikey: process.env.ETHERSCAN_API_KEY,
    }

    const response = await axios.get(`https://api.etherscan.io/api`, {
      params,
    })

    return response.data?.result?.ethusd
  } catch (error) {
    console.error(`Could not get ETH price using Etherscan API`, error)
    return null
  }
}
