import config from 'config'
import type { FilterQuery } from 'mongoose'
import request from 'request'
import util from 'util'
import { ethers } from 'ethers'

import { UserTokenModel } from '../models/user-token.model'
import type { UserTokenDocument } from '../models/user-token.model'
import type {
  TwitterLoginCompletion,
  TwitterLoginInitiation,
  TwitterUserTokensQueryOptions,
} from '../types/user-token.types'
import { generateAuthToken } from '../util/jwtTokenUtil'
import { mapUserTokenResponse } from '../util/userTokenUtil'
import { InternalServerError } from './errors'
import { IUserV2, UserV2Document, UserV2Model, Wallet } from '../models/user-v2.model'
import crypto from 'crypto'
import { NonceModel } from '../models/nonce.model'
import { UserV2LoginCompletion, UserV2TokenPrivateResponse, UserV2TokenPublicResponse } from '../types/user-v2.types'
import { formatWalletAddress, mapUserV2TokenPrivateResponse, mapUserV2TokenPublicResponse } from '../util/userV2Util'

const requestPromise = util.promisify(request)

const clientHostUrl = config.get<string>('client.hostUrl')
const backendHostUrl = config.get<string>('server.hostUrl')

function generateNonce(whyspiaUserID: string): string {
  const randomBytes = crypto.randomBytes(16).toString('hex')
  const timestamp = Date.now()
  return `${randomBytes}:${timestamp}:${whyspiaUserID}`
}

export async function initiateLoginDB({ particleUUID, wallets, primaryWallet }: {
  particleUUID: string
  wallets: Wallet[]
  primaryWallet: string
}): Promise<string> {
  const existingUserDoc = await UserV2Model.findOne({ particleUUID })
  let newUserDoc = null
  if (!existingUserDoc) {
    newUserDoc = UserV2Model.build({
      particleUUID,
      wallets,
      primaryWallet,
      displayName: formatWalletAddress(primaryWallet) // in very beginning, default displayName is formatted primaryWallet
    })
    await UserV2Model.create(newUserDoc)
  }

  const finalUserDoc = (existingUserDoc ?? newUserDoc) as UserV2Document

  // delete any previous nonces for the given primaryWallet
  await NonceModel.deleteMany({ userID: primaryWallet })

  const nonce = generateNonce(finalUserDoc._id.toString())
  // need to store nonce temporarily in DB to validate it in later ping to api
  const nonceDoc = NonceModel.build({
    userID: primaryWallet,
    nonce: nonce,
  })
  await NonceModel.create(nonceDoc)

  // create signature message for wallet/user to sign on frontend and send back here to completeLogin
  const messageToSign = `ONE MORE POPUP TO LOGIN...wE pRoMiSe.\n~~~~~~~~~~~details below are necessary, but you dont have to read them~~~~~~~~~~~~\nPlease sign this message to authenticate with whyspia.\nNonce: ${nonce}\nWallet: ${primaryWallet}`

  return messageToSign
}

async function verifySignatureAndTimestamp(
  signedMessage: string,
  signature: string,
  publicAddress: string,
  maxAgeMinutes: number = 5
): Promise<boolean> {
  try {
    // verify the signature
    const signerAddr = ethers.verifyMessage(signedMessage, signature)
    if (signerAddr.toLowerCase() !== publicAddress.toLowerCase()) {
      return false
    }

    // i need to extract nonce from message bc my message is more than just a nonce - unlike claude example
    const noncePattern = /Nonce:\s*([^\n]+)\n/ // regular expression to capture the nonce
    const match = noncePattern.exec(signedMessage)
    
    if (!match || match.length < 2) {
      console.error('error verifying signature: nonce not in message')
      throw new InternalServerError(
        'error verifying signature: nonce not in message'
      )
    }

    const extractedNonce = match[1]

    // extract timestamp from the nonce
    const parts = extractedNonce.split(':')
    if (parts.length !== 3) {
      throw new Error('invalid message format')
    }
    const timestamp = parseInt(parts[1], 10)

    // check if the timestamp is within the allowed range
    const currentTime = Date.now()
    const maxAgeMsec = maxAgeMinutes * 60 * 1000
    if (currentTime - timestamp > maxAgeMsec) {
      console.error('signature expired')
      return false
    }

    return true
  } catch (err) {
    console.error('error verifying signature:', err)
    return false
  }
}

export async function completeLoginDB({
  signature,
  signingAddress,
}: {
  signature: string
  signingAddress: string
}): Promise<UserV2LoginCompletion> {

  // pull nonce from DB
  const storedNonceDoc = await NonceModel.findOneAndDelete({
    userID: signingAddress,
  })

  if (!storedNonceDoc) {
    console.error('error completing login: stored nonce not found for the wallet given')
    throw new InternalServerError(
      'error completing login: stored nonce not found for the wallet given'
    )
  }

  const storedNonce = storedNonceDoc?.nonce

  // recreate signature message that wallet/user signed on frontend and sent back here to completeLogin
  const message = `ONE MORE POPUP TO LOGIN...wE pRoMiSe.\n~~~~~~~~~~~details below are necessary, but you dont have to read them~~~~~~~~~~~~\nPlease sign this message to authenticate with whyspia.\nNonce: ${storedNonce}\nWallet: ${signingAddress}`

  const isValid = await verifySignatureAndTimestamp(message, signature, signingAddress)

  if (!isValid) {
    console.error('error completing login: signature not valid')
    throw new InternalServerError(
      'error completing login: signature not valid'
    )
  }

  // TODO: use primaryWallet instead
  const userDoc = await UserV2Model.findOne({
    primaryWallet: { $regex: new RegExp(`^${signingAddress}$`, 'i') } // regex just makes so case doesnt matter during this check
  })
  if (!userDoc) {
    console.error('userv2 doc not found')
    throw new InternalServerError('failed to fetch userv2 doc')
  }
  
  const { authToken, validUntil } = generateAuthToken(
    userDoc._id.toString()
  )
  if (!authToken) {
    throw new InternalServerError('error occured while generating auth token')
  }

  return {
    jwt: authToken,
    validUntil,
    userToken: mapUserV2TokenPrivateResponse(userDoc),
  }
}

export async function fetchUserV2TokenPrivateFromDB({
  userTokenID,
  // twitterUsername,
}: {
  userTokenID: string | null
  // twitterUsername: string | null
}) {
  let userTokenDoc: UserV2Document | null = null

  if (userTokenID) {
    userTokenDoc = await UserV2Model.findById(userTokenID)
  }
  // else if (twitterUsername) {
  //   userTokenDoc = await UserTokenModel.findOne({
  //     twitterUsername: { $regex: new RegExp(new RegExp("^" + twitterUsername + "$", 'iu'), 'iu') },
  //   }) // This regexp queries for twitterUsername and disregards case
  // }

  if (!userTokenDoc) {
    return null
  }

  return mapUserV2TokenPrivateResponse(userTokenDoc)
}

export async function fetchUserV2TokenPublicFromDB({
  primaryWallet,
}: {
  primaryWallet: string | null
}) {
  let userTokenDoc: UserV2Document | null = null

  if (primaryWallet) {
    userTokenDoc = await UserV2Model.findOne({ primaryWallet })
  }

  if (!userTokenDoc) {
    return null
  }

  // in mapping, remove private data from returned data since dis public data
  return mapUserV2TokenPublicResponse(userTokenDoc)
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

export async function updateUserTokenInDB(
{
  updatedDisplayName,
  userTokenID,
}: {
  updatedDisplayName: string
  userTokenID: string
}): Promise<UserV2TokenPrivateResponse | null> {
  try {
    const updateData: Partial<IUserV2> = {}

    if (updatedDisplayName) {
      updateData.displayName = updatedDisplayName
    }

    // if (updatedEventDescription) {
    //   updateData.eventDescription = updatedEventDescription
    // }

    const updatedUserTokenDoc = await UserV2Model.findOneAndUpdate(
      {
        _id: userTokenID && userTokenID !== '' ? userTokenID : null,
      },
      updateData,
      { new: true }
    )

    return updatedUserTokenDoc ? mapUserV2TokenPrivateResponse(updatedUserTokenDoc as any) : null
    
  } catch (error) {
    console.error('error occurred while updating user token in DB', error)
    throw new InternalServerError('failed to update user token in DB')
  }
}
