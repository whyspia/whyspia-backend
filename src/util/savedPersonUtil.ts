import { UserV2Document } from '../models/user-v2.model'
import { mapUserV2TokenPublicResponse } from './userV2Util'
import { SavedPersonResponse } from '../types/saved-person.types'
import { SavedPersonDocument } from '../models/saved-person.model'

export function mapSavedPersonResponse(
  savedPersonDoc: SavedPersonDocument | null,
  primaryWalletSavedUserDoc: UserV2Document | null,
): SavedPersonResponse | null {
  if (!savedPersonDoc) {
    return null
  }

  return {
    id: savedPersonDoc?._id?.toString() || savedPersonDoc?.id,
    savedBy: savedPersonDoc?.savedBy,
    primaryWalletSaved: savedPersonDoc?.primaryWalletSaved,
    primaryWalletSavedUser: mapUserV2TokenPublicResponse(primaryWalletSavedUserDoc),
    chosenName: savedPersonDoc?.chosenName,
    createdAt: (savedPersonDoc as any)?.createdAt,
  }
}
