import { UserV2TokenResponse } from '../types/user-v2.types'
import { UserV2Document } from '../models/user-v2.model'

export function mapUserV2TokenResponse(
  userTokenDoc: UserV2Document | null
): UserV2TokenResponse | null {
  if (!userTokenDoc) {
    return null
  }

  return {
    id: userTokenDoc._id.toString(),
    particleUUID: userTokenDoc.particleUUID,
    wallets: userTokenDoc.wallets,
    primaryWallet: userTokenDoc.primaryWallet,
  }
}
