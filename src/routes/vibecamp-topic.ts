import express from 'express'
import {
  createVibecampTopic,
  deleteVibecampTopic,
  fetchAllVibecampTopics,
  fetchVibecampTopic,
} from '../controllers/vibecamp-topic.controller'

export const vibecampTopicRouter = express.Router() as any

vibecampTopicRouter.post('/', createVibecampTopic)
vibecampTopicRouter.get('/', fetchAllVibecampTopics)
vibecampTopicRouter.get('/:id', fetchVibecampTopic)
vibecampTopicRouter.delete('/:id', deleteVibecampTopic) 