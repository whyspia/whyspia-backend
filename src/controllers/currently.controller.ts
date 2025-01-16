import type { Request, Response } from 'express'
import { handleError, handleSuccess } from '../lib/base'
import {
  createCurrentlyInDB,
  fetchCurrentlyFromDB,
  fetchAllCurrentlyFromDB,
  updateCurrentlyInDB,
  deleteCurrentlyInDB,
} from '../services/currently.service'
import { CurrentlyRequest, CurrentlyUpdate, CurrentlyUpdateTypes, type CurrentlyQueryOptions, type CurrentlyResponse } from '../types/currently.types'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'
import { createDefinedEventInDB } from '../services/defined-event.service'
import { SAVED_SYMBOL_TYPES } from '../util/definedEventUtil'

export async function createCurrently(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const requestingPrimaryWallet = decodedAccount?.primaryWallet
    const reqBody = req.body
    const updates = reqBody.updates as CurrentlyUpdate[]

    const newCurrentlyRecord = {
      senderPrimaryWallet: requestingPrimaryWallet,
      place: null,
      wantOthersToKnowTags: [],
      status: null,
    } as CurrentlyRequest

    // Step 2: Process each update
    updates.forEach(update => {
      switch (update.updateType) {

        case CurrentlyUpdateTypes.NEW_PLACE:
          if (update.shouldSavePlaceOnShare) {
            createDefinedEventInDB({
              eventCreator: requestingPrimaryWallet,
              eventName: update.newValue.text,
              eventDescription: null,
              savedSymbolTypes: [SAVED_SYMBOL_TYPES.CURRENTLY, SAVED_SYMBOL_TYPES.PLACE],
            })
          }

          newCurrentlyRecord.place = { text: update.newValue.text, duration: update.newValue.duration, updatedDurationAt: new Date() }
          break

        case CurrentlyUpdateTypes.NEW_TAG:
          newCurrentlyRecord.wantOthersToKnowTags.push({ tag: update.newValue.tag, duration: update.newValue.duration, updatedDurationAt: new Date() })
          break

        case CurrentlyUpdateTypes.NEW_STATUS:
          newCurrentlyRecord.status = { text: update.newValue.text, duration: update.newValue.duration, updatedDurationAt: new Date() }
          break


        default:
          throw new Error('invalid update type')
      }
    })

    const currently = await createCurrentlyInDB(newCurrentlyRecord)
    return handleSuccess(res, { currently })
  } catch (error) {
    console.error('error occurred while creating Currently', error)
    return handleError(res, error, 'unable to create Currently')
  }
}

export async function fetchCurrently(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const requestingPrimaryWallet = decodedAccount?.primaryWallet
    const currentlyID = req.query.currentlyID as string
    const currently = await fetchCurrentlyFromDB({
      requestingPrimaryWallet,
      currentlyID,
    })
    return handleSuccess(res, { currently })
  } catch (error) {
    console.error('error occurred while fetching Currently', error)
    return handleError(res, error, 'unable to fetch Currently')
  }
}

export async function fetchAllCurrently(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const requestingPrimaryWallet = decodedAccount?.primaryWallet
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof CurrentlyResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    const senderPrimaryWallet = req.query.senderPrimaryWallet as string ?? null
    const search = (req.query.search as string) || null
    const anyActiveField = req.query.anyActiveField === 'true'
    const anyActivePlace = req.query.anyActivePlace === 'true'
    const placeName = req.query.placeName as string
    const filterBySavedPeopleOfRequestingUser = req.query.savedPeopleOfRequestingUser === 'true'

    const options: CurrentlyQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      search,
      senderPrimaryWallet,
      requestingPrimaryWallet,
      anyActiveField,
      anyActivePlace,
      placeName,
      filterBySavedPeopleOfRequestingUser,
    }
    const currentlyList = await fetchAllCurrentlyFromDB(options)
    return handleSuccess(res, { currentlyList })
  } catch (error) {
    console.error('error occurred while fetching all Currently', error)
    return handleError(res, error, 'unable to fetch all Currently')
  }
}

export async function updateCurrently(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const requestingPrimaryWallet = decodedAccount?.primaryWallet
    const reqBody = req.body
    // const currentlyID = reqBody.currentlyID as string
    const updates = reqBody.updates as CurrentlyUpdate[]

    const updatedCurrently = await updateCurrentlyInDB(updates, requestingPrimaryWallet)
    return handleSuccess(res, { updatedCurrently })
  } catch (error) {
    console.error('error occurred while updating Currently', error)
    return handleError(res, error, 'unable to update Currently')
  }
}

export async function deleteCurrently(req: Request, res: Response) {
  try {
    const currentlyID = req.body.currentlyID as string
    await deleteCurrentlyInDB(currentlyID)
    return handleSuccess(res, { message: 'Currently deleted successfully' })
  } catch (error) {
    console.error('error occurred while deleting Currently', error)
    return handleError(res, error, 'unable to delete Currently')
  }
}
