import type { FilterQuery } from 'mongoose'
import { ethers } from 'ethers'

import { generateAuthToken } from '../util/jwtTokenUtil'
import { InternalServerError } from './errors'
import { IUserV2, UserV2Document, UserV2Model, Wallet } from '../models/user-v2.model'
import crypto from 'crypto'
import { NonceModel } from '../models/nonce.model'
import { UserV2LoginCompletion, UserV2TokenPrivateResponse, UserV2TokenPublicResponseWithDisplayName, UserV2TokensQueryOptions } from '../types/user-v2.types'
import { formatWalletAddress, mapUserV2TokenPrivateResponse, mapUserV2TokenPublicResponse } from '../util/userV2Util'
import { SavedPersonModel } from '../models/saved-person.model'


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
      chosenPublicName: formatWalletAddress(primaryWallet) // in very beginning, default chosenPublicName is formatted primaryWallet
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
  const messageToSign = `you dont have to read any of this, it is just here for technical reasons.\n\nPlease sign this message to authenticate with whyspia.\n\nNonce: ${nonce}\n\nwhyspiaID: ${primaryWallet}`

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
  const message = `you dont have to read any of this, it is just here for technical reasons.\n\nPlease sign this message to authenticate with whyspia.\n\nNonce: ${storedNonce}\n\nwhyspiaID: ${signingAddress}`

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
  // primaryWallet,
}: {
  userTokenID: string | null
  // primaryWallet: string | null
}) {
  let userTokenDoc: UserV2Document | null = null

  if (userTokenID) {
    userTokenDoc = await UserV2Model.findById(userTokenID)
  }
  // else if (primaryWallet) {
  //   userTokenDoc = await UserTokenModel.findOne({
  //     primaryWallet: { $regex: new RegExp(new RegExp("^" + primaryWallet + "$", 'iu'), 'iu') },
  //   }) // This regexp queries for primaryWallet and disregards case
  // }

  if (!userTokenDoc) {
    return null
  }

  return mapUserV2TokenPrivateResponse(userTokenDoc)
}

export async function fetchUserV2TokenPublicFromDB({
  primaryWallet,
  requestingPrimaryWallet,
}: {
  primaryWallet: string | null
  requestingPrimaryWallet: string | null
}) {
  let userTokenDoc: UserV2Document | null = null

  if (primaryWallet) {
    userTokenDoc = await UserV2Model.findOne({ primaryWallet })
  }

  // user with this primaryWallet not in DB
  if (!userTokenDoc) {
    // user not in DB, so create fake user to fill response. This is bc maybe user hasnt inited into whyspia, BUT their wallet is still what is being interacted with (and maybe this really is their main wallet/identity)
    // return null
    userTokenDoc = UserV2Model.build({
      particleUUID: 'fakeParticleUUID',
      wallets: [],
      primaryWallet,
      chosenPublicName: formatWalletAddress(primaryWallet as string) // in very beginning, default chosenPublicName is formatted primaryWallet
    } as any)
  }

  const userWithDisplayName = await getUserTokenWithDisplayName(userTokenDoc, requestingPrimaryWallet)

  // in mapping, remove private data from returned data since dis public data
  return mapUserV2TokenPublicResponse(userWithDisplayName)
}

// mainly used once you already have userToken fetched to then get the calculatedDisplayName
export async function getUserTokenWithDisplayName(
  userDoc: UserV2Document | null,
  requestingPrimaryWallet: string | null
): Promise<UserV2TokenPublicResponseWithDisplayName | null> {
  if (!userDoc) {
    return null
  }

  const { primaryWallet, chosenPublicName } = userDoc

  if (!requestingPrimaryWallet) {
    return {
      primaryWallet,
      chosenPublicName,
      calculatedDisplayName: chosenPublicName,
      requestingPrimaryWallet: null,
      isRequestedUserSavedByRequestingUser: false,
    }
  }

  // check if there is a SavedPerson record for the target primaryWallet
  const savedPerson = await SavedPersonModel.findOne({
    primaryWalletSaved: primaryWallet,
    savedBy: requestingPrimaryWallet
  })

  const calculatedDisplayName = savedPerson ? savedPerson.chosenName : chosenPublicName

  return {
    primaryWallet,
    chosenPublicName,
    calculatedDisplayName,
    requestingPrimaryWallet,
    isRequestedUserSavedByRequestingUser: Boolean(savedPerson),
  }
}

// it seems youll only get userDoc if user part of field mapping in the record has user object - which pretty much only comes from lookup of aggregates at the moment
// @docs - can be any list of records that contain 1 or more wallets that need their userTokens fetched
// @return object where index is primaryWallet and value is userToken of that wallet
export async function getMappingListOfWalletToUserToken(
  docs: any[], // The list of documents to iterate over
  fieldMapping: Record<string, string>, // Mapping of wallet field names to user document field names (the field itself can also be list of wallets...but no deeper nesting than that)
  requestingPrimaryWallet: string // The requesting wallet
): Promise<Record<string, any>> { // Return type is the populated map
  const userWithDisplayNameMap: Record<string, any> = {}

  for (const doc of docs) {
    for (const [walletField, userField] of Object.entries(fieldMapping)) {
      const wallets = doc[walletField] // Access the wallet field, which can be an array

      // Check if the wallet field is an array
      if (Array.isArray(wallets)) {
        for (const wallet of wallets) {
          // For each wallet, retrieve the corresponding user document
          const userDoc = doc[userField] ? doc[userField].find((user: any) => user.primaryWallet === wallet) : null

          // Check if the userWithDisplayNameMap already has this wallet
          if (!userWithDisplayNameMap[wallet]) {
            // If userDoc exists, use it; otherwise, fetch the user token
            const userWithDisplayName = userDoc
              ? await getUserTokenWithDisplayName(userDoc, requestingPrimaryWallet)
              : await fetchUserV2TokenPublicFromDB({ primaryWallet: wallet, requestingPrimaryWallet })

            userWithDisplayNameMap[wallet] = userWithDisplayName
          }
        }
      } else {
        // If it's not an array, treat it as a single wallet
        const wallet = wallets // This should be a single wallet string
        const userDoc = doc[userField] ? doc[userField][0] : null // Access the user document based on the user field name

        if (!userWithDisplayNameMap[wallet]) {
          const userWithDisplayName = userDoc
            ? await getUserTokenWithDisplayName(userDoc, requestingPrimaryWallet)
            : await fetchUserV2TokenPublicFromDB({ primaryWallet: wallet, requestingPrimaryWallet })

          userWithDisplayNameMap[wallet] = userWithDisplayName
        }
      }
    }
  }

  return userWithDisplayNameMap // Return the populated map
}

export async function fetchAllUserV2TokensFromDB(
  options: UserV2TokensQueryOptions
) {
  try {
    const { skip, limit, orderBy, search, filterWallets, requestingPrimaryWallet } = options
    const orderDirection = options.orderDirection === 'asc' ? 1 : -1

    // Sorting Options
    const sortOptions: any = {}
    sortOptions[orderBy] = orderDirection
    sortOptions._id = 1

    // Filter Options
    const filterOptions: FilterQuery<UserV2Document>[] = []
    if (filterWallets.length > 0) {
      filterOptions.push({ primaryWallet: { $in: filterWallets } })
    }
    if (search) {
      filterOptions.push({
        $or: [
          { primaryWallet: { $regex: new RegExp(search, 'iu'), }, },
          { chosenPublicName: { $regex: new RegExp(search, 'iu'), }, },
        ],
      })
    }

    // Filter Query
    let filterQuery = {}
    if (filterOptions.length > 0) {
      filterQuery = { $and: filterOptions }
    }

    const userV2Tokens = await UserV2Model
      .find(filterQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)

    const userWithDisplayNameMap = {} as any
    for (const userToken of userV2Tokens) {
      const userWithDisplayName = await getUserTokenWithDisplayName(userToken, requestingPrimaryWallet)
      userWithDisplayNameMap[userToken.primaryWallet] = userWithDisplayName
    }

    return userV2Tokens.map((userV2Token) => {
      const userTokenWithDisplayName = userWithDisplayNameMap[userV2Token.primaryWallet]
      const finalUserToken = userTokenWithDisplayName ?? userV2Token
      return mapUserV2TokenPublicResponse(finalUserToken as any)
    })
  } catch (error) {
    console.error('error occurred while fetching userv2 tokens', error)
    throw new InternalServerError('error occurred while fetching userv2 tokens')
  }
}

export async function updateUserTokenInDB(
{
  updatedChosenPublicName,
  userTokenID,
}: {
  updatedChosenPublicName: string
  userTokenID: string
}): Promise<UserV2TokenPrivateResponse | null> {
  try {
    const updateData: Partial<IUserV2> = {}

    if (updatedChosenPublicName) {
      updateData.chosenPublicName = updatedChosenPublicName
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
