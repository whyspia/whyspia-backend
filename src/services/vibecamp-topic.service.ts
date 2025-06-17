import { VibecampTopicModel } from '../models/vibecamp-topic.model'
import type { VibecampTopicQueryOptions } from '../types/vibecamp-topic.types'

export async function createVibecampTopicInDB(data: {
  contact: string
  topic: string
  additional?: string
}) {
  const topic = VibecampTopicModel.build(data)
  return await topic.save()
}

export async function fetchVibecampTopicFromDB(id: string) {
  return await VibecampTopicModel.findById(id)
}

export async function fetchAllVibecampTopicsFromDB(options: VibecampTopicQueryOptions = {}) {
  const { search, limit = 50, skip = 0 } = options

  const query: any = {}
  if (search) {
    query.$or = [
      { topic: { $regex: search, $options: 'i' } },
      { contact: { $regex: search, $options: 'i' } },
      { additional: { $regex: search, $options: 'i' } }
    ]
  }

  return await VibecampTopicModel.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
}

export async function deleteVibecampTopicFromDB(id: string) {
  return await VibecampTopicModel.findByIdAndDelete(id)
} 