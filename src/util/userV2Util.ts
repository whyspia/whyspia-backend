import { UserV2TokenPrivateResponse, UserV2TokenPublicResponse, UserV2TokenPublicResponseWithDisplayName } from '../types/user-v2.types'
import { UserV2Document } from '../models/user-v2.model'

export function mapUserV2TokenPrivateResponse(
  userTokenDoc: UserV2Document | null
): UserV2TokenPrivateResponse | null {
  if (!userTokenDoc) {
    return null
  }

  return {
    id: userTokenDoc._id.toString(),
    particleUUID: userTokenDoc.particleUUID,
    wallets: userTokenDoc.wallets,
    primaryWallet: userTokenDoc.primaryWallet,
    chosenPublicName: userTokenDoc.chosenPublicName,
  }
}

export function mapUserV2TokenPublicResponse(
  userToken: UserV2TokenPublicResponseWithDisplayName | null
): UserV2TokenPublicResponseWithDisplayName | null {
  if (!userToken) {
    return null
  }

  return {
    primaryWallet: userToken.primaryWallet,
    chosenPublicName: userToken.chosenPublicName,
    calculatedDisplayName: userToken.calculatedDisplayName,
    requestingPrimaryWallet: userToken.requestingPrimaryWallet,
    isRequestedUserSavedByRequestingUser: userToken.isRequestedUserSavedByRequestingUser,
  }
}

export const formatWalletAddress = (address: string | undefined): string => {
  if (!address || typeof address !== 'string' || address.length < 10) {
    return 'invalid address'
  }
  return `0x${address.slice(2, 6)}...${address.slice(-4)}`
}
