import type { Request, Response } from 'express'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

import { handleError, handleSuccess } from '../lib/base'
import {
  createDefinedEventInDB,
  fetchAllDefinedEventsFromDB,
  fetchDefinedEventFromDB,
  updateDefinedEventInDB,
  deleteDefinedEventInDB,
} from '../services/defined-event.service'
import type { DefinedEventQueryOptions, DefinedEventResponse } from '../types/defined-event.types'
import { EMOTE_CONTEXTS } from '../util/contextUtil'
import { createEmoteInDB } from '../services/emote.service'

export async function createDefinedEvent(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const reqBody = req.body
    const requestData = {
      eventCreator: decodedAccount.twitterUsername,
      eventName: reqBody.eventName,
      eventDescription: reqBody?.eventDescription || null,
    }
    const definedEvent = await createDefinedEventInDB(requestData);

    // send ze emote out
    const emoteRequestData = {
      senderTwitterUsername: decodedAccount.twitterUsername,
      receiverSymbols: [EMOTE_CONTEXTS.PINGPPL],
      sentSymbols: ["PINGPLAN: " + reqBody.eventName],
    }
    await createEmoteInDB(emoteRequestData, false)

    return handleSuccess(res, { definedEvent })
  } catch (error) {
    console.error('Error occurred while creating DefinedEvent', error)
    return handleError(res, error, 'Unable to create DefinedEvent')
  }
}

export async function fetchDefinedEvent(req: Request, res: Response) {
  try {
    // const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const eventCreator = req.query.eventCreator as string
    const definedEventId = req.query.definedEventId as string
    const eventName = req.query.eventName as string
    const definedEvent = await fetchDefinedEventFromDB({
      definedEventId,
      eventName,
      eventCreator,
    })
    return handleSuccess(res, { definedEvent })
  } catch (error) {
    console.error('Error occurred while fetching DefinedEvent', error)
    return handleError(res, error, 'Unable to fetch DefinedEvent')
  }
}

export async function fetchAllDefinedEvents(req: Request, res: Response) {
  try {
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof DefinedEventResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    // const search = (req.query.search as string) || null
    const eventCreator = (req.query.eventCreator as string) || null
    const eventName = (req.query.eventName as string) || null
    const search = (req.query.search as string) || null

    const options: DefinedEventQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      search,
      eventCreator,
      eventName,
    }

    const definedEvents = await fetchAllDefinedEventsFromDB(options)
    return handleSuccess(res, { definedEvents })
  } catch (error) {
    console.error('Error occurred while fetching all DefinedEvents', error)
    return handleError(res, error, 'Unable to fetch all DefinedEvents')
  }
}

export async function updateDefinedEvent(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const definedEventId = req.body.definedEventId as string
    const updatedEventName = req.body?.updatedEventName as string || null
    const updatedEventDescription = req.body?.updatedEventDescription as string || null
    const updatedDefinedEvent = await updateDefinedEventInDB({
      eventCreator: decodedAccount.twitterUsername,
      definedEventId,
      updatedEventName,
      updatedEventDescription,
    })
    return handleSuccess(res, { updatedDefinedEvent })
  } catch (error) {
    console.error('Error occurred while updating DefinedEvent', error)
    return handleError(res, error, 'Unable to update DefinedEvent')
  }
}

export async function deleteDefinedEvent(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const definedEventId = req.body.definedEventId as string
    await deleteDefinedEventInDB(definedEventId, decodedAccount.twitterUsername)
    return handleSuccess(res, { message: `DefinedEvent with ID ${definedEventId} has been deleted` })
  } catch (error) {
    console.error('Error occurred while deleting DefinedEvent', error)
    return handleError(res, error, 'Unable to delete DefinedEvent')
  }
}
