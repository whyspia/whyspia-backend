import type { Request, Response } from 'express'
import { DECODED_ACCOUNT } from '../util/jwtTokenUtil'

import { handleError, handleSuccess } from '../lib/base'
import {
  createSentEventInDB,
  fetchAllSentEventsFromDB,
  fetchSentEventFromDB,
} from '../services/sent-event.service'
import type { SentEventQueryOptions, SentEventResponse } from '../types/sent-event.types'
import { createDefinedEventInDB } from '../services/defined-event.service'

export async function createSentEvent(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const reqBody = req.body
    const requestData = {
      eventSender: decodedAccount.twitterUsername,
      eventName: reqBody.eventName,
      definedEventID: reqBody?.definedEventID,
    }
    const sentEvent = await createSentEventInDB(requestData);

    // send ze emote out
    // const emoteRequestData = {
    //   senderTwitterUsername: decodedAccount.twitterUsername,
    //   receiverSymbols: [EMOTE_CONTEXTS.PINGPPL],
    //   sentSymbols: ["PING: " + reqBody.eventName],
    // }
    // await createEmoteInDB(emoteRequestData, false) // notif not going to pingppl context receiver, but there will be custom logic for who notif goes to in this method

    return handleSuccess(res, { sentEvent })
  } catch (error) {
    console.error('Error occurred while creating SentEvent', error)
    return handleError(res, error, 'Unable to create SentEvent')
  }
}

export async function createDefinedEventAndThenSentEvent(req: Request, res: Response) {
  try {
    const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const reqBody = req.body

    const definedEventRequestData = {
      eventCreator: decodedAccount.twitterUsername,
      eventName: reqBody.eventName,
      eventDescription: reqBody?.eventDescription || null,
    }
    const definedEvent = await createDefinedEventInDB(definedEventRequestData)

    const sentEventRequestData = {
      eventSender: decodedAccount.twitterUsername,
      eventName: reqBody.eventName,
      definedEventID: definedEvent?.id,
    }
    const sentEvent = await createSentEventInDB(sentEventRequestData);

    // send ze emote out
    // const emoteRequestData = {
    //   senderTwitterUsername: decodedAccount.twitterUsername,
    //   receiverSymbols: [EMOTE_CONTEXTS.PINGPPL],
    //   sentSymbols: ["PINGPLAN&PING: " + reqBody.eventName],
    // }
    // await createEmoteInDB(emoteRequestData, false) // notif not going to pingppl context receiver, but there will be custom logic for who notif goes to in this method

    return handleSuccess(res, { definedEvent, sentEvent })
  } catch (error) {
    console.error('Error occurred while createDefinedEventAndThenSentEvent', error)
    return handleError(res, error, 'Unable to createDefinedEventAndThenSentEvent')
  }
}

export async function fetchSentEvent(req: Request, res: Response) {
  try {
    // const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
    const eventSender = req.query.eventSender as string
    const sentEventId = req.query.sentEventId as string
    const eventName = req.query.eventName as string
    const sentEvent = await fetchSentEventFromDB({
      sentEventId,
      eventName,
      eventSender,
    })
    return handleSuccess(res, { sentEvent })
  } catch (error) {
    console.error('Error occurred while fetching SentEvent', error)
    return handleError(res, error, 'Unable to fetch SentEvent')
  }
}

export async function fetchAllSentEvents(req: Request, res: Response) {
  try {
    const skip = Number.parseInt(req.query.skip as string) || 0
    const limit = Number.parseInt(req.query.limit as string) || 10
    const orderBy = req.query.orderBy as keyof SentEventResponse
    const orderDirection =
      (req.query.orderDirection as string | undefined) ?? 'desc'
    // const search = (req.query.search as string) || null
    const eventSender = (req.query.eventSender as string) || null
    const eventName = (req.query.eventName as string) || null

    const options: SentEventQueryOptions = {
      skip,
      limit,
      orderBy,
      orderDirection,
      // search,
      eventSender,
      eventName,
    }

    const sentEvents = await fetchAllSentEventsFromDB(options)
    return handleSuccess(res, { sentEvents })
  } catch (error) {
    console.error('Error occurred while fetching all SentEvents', error)
    return handleError(res, error, 'Unable to fetch all SentEvents')
  }
}

// you cant really update a sent-event - you can update defined-event from visuals of sent-event - and you can set sent-event inactive tho
// export async function updateSentEvent(req: Request, res: Response) {
//   try {
//     const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
//     const sentEventId = req.body.sentEventId as string
//     const updatedEventName = req.body?.updatedEventName as string || null
//     const updatedEventDescription = req.body?.updatedEventDescription as string || null
//     const updatedSentEvent = await updateSentEventInDB({
//       eventSender: decodedAccount.twitterUsername,
//       sentEventId,
//       updatedEventName,
//       updatedEventDescription,
//     })
//     return handleSuccess(res, { updatedSentEvent })
//   } catch (error) {
//     console.error('Error occurred while updating SentEvent', error)
//     return handleError(res, error, 'Unable to update SentEvent')
//   }
// }

// TODO: make so deleting doesnt actually delete, but sets inactive and shows that to users who got notified of the event and can now see visually it was deleted
// export async function deleteSentEvent(req: Request, res: Response) {
//   try {
//     const decodedAccount = (req as any).decodedAccount as DECODED_ACCOUNT
//     const sentEventId = req.body.sentEventId as string
//     await deleteSentEventInDB(sentEventId, decodedAccount.twitterUsername)
//     return handleSuccess(res, { message: `SentEvent with ID ${sentEventId} has been deleted` })
//   } catch (error) {
//     console.error('Error occurred while deleting SentEvent', error)
//     return handleError(res, error, 'Unable to delete SentEvent')
//   }
// }
