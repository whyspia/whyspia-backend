import { UserV2TokenPrivateResponse, UserV2TokenPublicResponse } from '../types/user-v2.types'
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
  userTokenDoc: UserV2Document | null
): UserV2TokenPublicResponse | null {
  if (!userTokenDoc) {
    return null
  }

  return {
    primaryWallet: userTokenDoc.primaryWallet,
    chosenPublicName: userTokenDoc.chosenPublicName,
  }
}

export const formatWalletAddress = (address: string | undefined): string => {
  if (!address || typeof address !== 'string' || address.length < 10) {
    return 'invalid address'
  }
  return `0x${address.slice(2, 6)}...${address.slice(-4)}`
}
