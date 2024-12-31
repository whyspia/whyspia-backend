import { Request, Response } from 'express'
import { handleError, handleSuccess } from '../lib/base'
import { createPlaceInDB, fetchAllPlacesFromDB, fetchPlaceFromDB, } from '../services/place.service'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'
import { PlaceQueryOptions, PlaceResponse } from '../types/place.types'

export const createPlace = async (req: Request, res: Response) => {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const requestData = {
      placeName: reqBody.placeName,
    }
    const place = await createPlaceInDB(requestData)
    return handleSuccess(res, { place })
  } catch (error) {
    console.error('error occurred while creating Place', error)
    return handleError(res, error, 'unable to create Place')
  }
}

export const fetchPlace = async (req: Request, res: Response) => {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const placeID = req.query.placeID as string
    const placeName = req.query.placeName as string
    const place = await fetchPlaceFromDB({
      // requestingPrimaryWallet: decodedAccount.primaryWallet,
      placeID,
      placeName,
    })
    return handleSuccess(res, { place })
  } catch (error) {
    console.error('error occurred while fetching Place', error)
    return handleError(res, error, 'unable to fetch Place')
  }
}

export const fetchAllPlaces = async (req: Request, res: Response) => {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof PlaceResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const search = (req.query.search as string) || null

    const requestingPrimaryWallet = decodedAccount?.primaryWallet

    const options: PlaceQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      search,
      requestingPrimaryWallet,
    }

    const places = await fetchAllPlacesFromDB(options)
    return handleSuccess(res, { places })
  } catch (error) {
    console.error('error occurred while fetching all Places', error)
    return handleError(res, error, 'unable to fetch all Places')
  }
}

// export const deletePlace = async (req: Request, res: Response) => {
//   try {
//     const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
//     const placeID = req.body.placeID as string
//     await deletePlaceInDB(placeID, decodedAccount.primaryWallet)
//     return handleSuccess(res, { message: 'Place deleted successfully' })
//   } catch (error) {
//     console.error('error occurred while deleting Place', error)
//     return handleError(res, error, 'unable to delete Place')
//   }
// } 