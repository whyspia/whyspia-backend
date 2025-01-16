import { UserV2TokenPublicResponse } from "./user-v2.types"

export type CurrentlyPlace = {
  text: string
  duration: number
  updatedDurationAt: Date
}

export type CurrentlyTag = {
  tag: string
  duration: number
  updatedDurationAt: Date
}

export type CurrentlyStatus = {
  text: string
  duration: number
  updatedDurationAt: Date
}

export interface CurrentlyRequest {
  senderPrimaryWallet: string
  place: CurrentlyPlace | null
  wantOthersToKnowTags: CurrentlyTag[]
  status: CurrentlyStatus | null
}

export interface CurrentlyResponse {
  id: string
  senderPrimaryWallet: string
  senderUser: UserV2TokenPublicResponse | null
  place: CurrentlyPlace | null
  wantOthersToKnowTags: CurrentlyTag[]
  status: CurrentlyStatus | null
  createdAt: Date
}

export interface CurrentlyQueryOptions {
  skip: number
  limit: number
  orderBy: any
  orderDirection: string
  search: string | null
  senderPrimaryWallet: string | null
  requestingPrimaryWallet: string
  anyActiveField?: boolean
  placeName?: string
  anyActivePlace?: boolean
  filterBySavedPeopleOfRequestingUser?: boolean
}

export type CurrentlyUpdate = {
  updateType: string
  newValue?: any
  target?: string
  shouldSavePlaceOnShare?: boolean
}

export const CurrentlyUpdateTypes = {
  EDIT_PLACE_TEXT: 'editPlaceText',
  EDIT_PLACE_DURATION: 'editPlaceDuration',
  NEW_PLACE: 'newPlace',
  DELETE_PLACE: 'deletePlace',
  NEW_TAG: 'newTag',
  EDIT_TAG_TEXT: 'editTagText',
  EDIT_TAG_DURATION: 'editTagDuration',
  DELETE_TAG: 'deleteTag',
  NEW_STATUS: 'newStatus',
  EDIT_STATUS_TEXT: 'editStatusText',
  EDIT_STATUS_DURATION: 'editStatusDuration',
  DELETE_STATUS: 'deleteStatus',
  CLEAR_ALL: 'clearAll',
}
