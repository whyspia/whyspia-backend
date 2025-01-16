import dotenv from 'dotenv'
dotenv.config()

import { connectMongoDB } from '../db/mongodb'
import { UserV2Model } from '../models/user-v2.model'
import { createCurrentlyInDB } from '../services/currently.service'
import type { CurrentlyRequest } from '../types/currently.types'

const MOCK_PLACES = [
  'Coffee Shop',
  'Library',
  'Gym',
  'Park',
  'Office',
  'Home',
  'Restaurant'
]

const MOCK_TAGS = [
  'Working',
  'Studying',
  'Reading',
  'Coding',
  'Meeting',
  'Relaxing',
  'Available to chat'
]

const MOCK_STATUSES = [
  'Feeling productive',
  'Need coffee',
  'In the zone',
  'Taking a break',
  'Don\'t disturb',
  'Open to hangout'
]

const MAX_DURATION_24H = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
const EXTENDED_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

const getRandomDuration = (): number => {
  return Math.floor(Math.random() * MAX_DURATION_24H)
}

const generateMockCurrently = (senderPrimaryWallet: string): Partial<CurrentlyRequest> => {
  const now = new Date()
  
  // Randomly decide which field gets the extended duration
  const extendedField = Math.floor(Math.random() * 3) // 0 = place, 1 = tags, 2 = status

  return {
    senderPrimaryWallet,
    place: {
      text: getRandomElement(MOCK_PLACES),
      duration: extendedField === 0 ? EXTENDED_DURATION : getRandomDuration(),
      updatedDurationAt: now
    },
    wantOthersToKnowTags: [
      {
        tag: getRandomElement(MOCK_TAGS),
        duration: extendedField === 1 ? EXTENDED_DURATION : getRandomDuration(),
        updatedDurationAt: now
      },
      {
        tag: getRandomElement(MOCK_TAGS),
        duration: getRandomDuration(), // Second tag always gets random duration under 24H
        updatedDurationAt: now
      }
    ],
    status: {
      text: getRandomElement(MOCK_STATUSES),
      duration: extendedField === 2 ? EXTENDED_DURATION : getRandomDuration(),
      updatedDurationAt: now
    }
  }
}

const createMockCurrentlies = async (wallets?: string[]) => {
  try {
    await connectMongoDB()

    let users
    if (wallets && wallets.length > 0) {
      // Get only specified users
      users = await UserV2Model.find({
        primaryWallet: { $in: wallets }
      })
      
      // Check if all wallets were found
      const foundWallets = users.map(u => u.primaryWallet)
      const notFound = wallets.filter(w => !foundWallets.includes(w))
      if (notFound.length > 0) {
        console.warn('Warning: Following wallets not found:', notFound)
      }
    } else {
      // Get all users if no wallets specified
      users = await UserV2Model.find()
    }
    
    // Create currently records for each user
    for (const user of users) {
      const mockCurrently = generateMockCurrently(user.primaryWallet)
      await createCurrentlyInDB(mockCurrently)
      console.log(`Created Currently record for user: ${user.primaryWallet}`)
    }

    console.log('Finished creating mock Currently records')
    process.exit(0)
  } catch (error) {
    console.error('Error creating mock Currently records:', error)
    process.exit(1)
  }
}

// Get wallet addresses from command line arguments
const wallets = process.argv.slice(2)
createMockCurrentlies(wallets)
