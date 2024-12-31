import { PlaceResponse } from '../types/place.types'
import { PlaceDocument } from '../models/place.model'

export function mapPlaceResponse(
  placeDoc: PlaceDocument | null,
): PlaceResponse | null {
  if (!placeDoc) {
    return null
  }

  return {
    id: placeDoc?._id?.toString() || placeDoc?.id,
    placeName: placeDoc?.placeName,
    visitCount: placeDoc?.visitCount,
    createdAt: (placeDoc as any)?.createdAt,
  }
}
