import { VibecampTopicDocument } from '../models/vibecamp-topic.model'

export interface VibecampTopicResponse {
  id: string
  contact: string
  topic: string
  additional?: string
  createdAt: Date
  updatedAt: Date
}

export interface VibecampTopicQueryOptions {
  search?: string
  limit?: number
  skip?: number
}

export const mapVibecampTopicToResponse = (topic: VibecampTopicDocument): VibecampTopicResponse => {
  return {
    id: topic.id,
    contact: topic.contact,
    topic: topic.topic,
    additional: topic.additional,
    createdAt: topic.createdAt,
    updatedAt: topic.updatedAt,
  }
} 