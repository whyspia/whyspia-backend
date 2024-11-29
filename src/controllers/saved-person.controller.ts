import type { Request, Response } from 'express'
import { handleError, handleSuccess } from '../lib/base'
import {
  createSavedPersonInDB,
  deleteSavedPersonInDB,
  fetchAllSavedPersonFromDB,
  fetchSavedPersonFromDB,
  updateSavedPersonInDB,
} from '../services/saved-person.service'
import type { SavedPersonQueryOptions, SavedPersonResponse } from '../types/saved-person.types'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

export async function createSavedPerson(req: Request, res: Response) {
  try {
    const reqBody = req.body
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const requestData = {
      savedBy: decodedAccount?.primaryWallet,
      primaryWalletSaved: reqBody.primaryWalletSaved,
      chosenName: reqBody.chosenName,
    }
    const savedPerson = await createSavedPersonInDB(requestData)
    return handleSuccess(res, { savedPerson })
  } catch (error) {
    console.error('error occurred while creating SavedPerson', error)
    return handleError(res, error, 'unable to create SavedPerson')
  }
}

export async function fetchSavedPerson(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const savedPersonID = req.query.savedPersonID as string
    const savedPerson = await fetchSavedPersonFromDB({
      requestingPrimaryWallet: decodedAccount.primaryWallet,
      savedPersonID,
    })
    return handleSuccess(res, { savedPerson })
  } catch (error) {
    console.error('error occurred while fetching SavedPerson', error)
    return handleError(res, error, 'unable to fetch SavedPerson')
  }
}

export async function fetchAllSavedPerson(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT

    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof SavedPersonResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const search = (req.query.search as string) || null

    // you gotta be savedBy to fetch SavedPersons (may change in future so you can fetch other people's SavedPersons...maybe with some privacy settings)
    const savedBy = decodedAccount?.primaryWallet

    const options: SavedPersonQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      search,
    }

    const savedPersons = await fetchAllSavedPersonFromDB(options, savedBy)
    return handleSuccess(res, { savedPersons })
  } catch (error) {
    console.error('error occurred while fetching all SavedPerson', error)
    return handleError(res, error, 'unable to fetch all SavedPerson')
  }
}

export async function updateSavedPerson(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const savedPersonID = req.body.savedPersonID as string
    const updatedData = {
      chosenName: req.body.updatedChosenName,
    }
    const updatedSavedPerson = await updateSavedPersonInDB({
      requestingPrimaryWallet: decodedAccount?.primaryWallet,
      savedPersonID,
      updatedData,
    })
    return handleSuccess(res, { updatedSavedPerson })
  } catch (error) {
    console.error('error occurred while updating SavedPerson', error)
    return handleError(res, error, 'unable to update SavedPerson')
  }
}

export async function deleteSavedPerson(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const savedPersonID = req.body.savedPersonID as string
    await deleteSavedPersonInDB(savedPersonID, decodedAccount.primaryWallet)
    return handleSuccess(res, { message: 'SavedPerson deleted successfully' })
  } catch (error) {
    console.error('error occurred while deleting SavedPerson', error)
    return handleError(res, error, 'unable to delete SavedPerson')
  }
}
