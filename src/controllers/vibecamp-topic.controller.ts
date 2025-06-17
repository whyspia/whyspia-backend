import type { Request, Response } from 'express'
import { handleError, handleSuccess } from '../lib/base'
import {
  createVibecampTopicInDB,
  deleteVibecampTopicFromDB,
  fetchAllVibecampTopicsFromDB,
  fetchVibecampTopicFromDB,
} from '../services/vibecamp-topic.service'
import { mapVibecampTopicToResponse } from '../types/vibecamp-topic.types'
import type { VibecampTopicQueryOptions } from '../types/vibecamp-topic.types'

export async function createVibecampTopic(req: Request, res: Response) {
  try {
    const { contact, topic, additional } = req.body
    const topicData = await createVibecampTopicInDB({ contact, topic, additional })
    return handleSuccess(res, { topic: mapVibecampTopicToResponse(topicData) })
  } catch (error) {
    console.error('Error occurred while creating Vibecamp topic', error)
    return handleError(res, error, 'Unable to create Vibecamp topic')
  }
}

export async function fetchVibecampTopic(req: Request, res: Response) {
  try {
    const { id } = req.params
    const topic = await fetchVibecampTopicFromDB(id)
    if (!topic) {
      return handleError(res, { message: 'Topic not found' }, 'Topic not found')
    }
    return handleSuccess(res, { topic: mapVibecampTopicToResponse(topic) })
  } catch (error) {
    console.error('Error occurred while fetching Vibecamp topic', error)
    return handleError(res, error, 'Unable to fetch Vibecamp topic')
  }
}

export async function fetchAllVibecampTopics(req: Request, res: Response) {
  try {
    const options: VibecampTopicQueryOptions = {
      search: req.query.search as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      skip: req.query.skip ? parseInt(req.query.skip as string) : undefined,
    }
    const topics = await fetchAllVibecampTopicsFromDB(options)
    return handleSuccess(res, { 
      topics: topics.map(mapVibecampTopicToResponse)
    })
  } catch (error) {
    console.error('Error occurred while fetching Vibecamp topics', error)
    return handleError(res, error, 'Unable to fetch Vibecamp topics')
  }
}

export async function deleteVibecampTopic(req: Request, res: Response) {
  try {
    const { id } = req.params
    const topic = await deleteVibecampTopicFromDB(id)
    if (!topic) {
      return handleError(res, { message: 'Topic not found' }, 'Topic not found')
    }
    return handleSuccess(res, { topic: mapVibecampTopicToResponse(topic) })
  } catch (error) {
    console.error('Error occurred while deleting Vibecamp topic', error)
    return handleError(res, error, 'Unable to delete Vibecamp topic')
  }
} 