// for some reason important for this to be at top lolz
import dotenv from 'dotenv'
dotenv.config()

import { UserV2Model } from '../models/user-v2.model'
import { Wallet } from '../models/user-v2.model'
import { connectMongoDB } from '../db/mongodb'

const generateRandomWallets = (num: number): Wallet[] => {
  const wallets: Wallet[] = []
  for (let i = 0; i < num; i++) {
    wallets.push({
      chain_name: `Chain ${i + 1}`,
      public_address: `0x${Math.random().toString(16).slice(2, 42)}`,
      uuid: `uuid-${i + 1}`,
    })
  }
  return wallets
}

const createMockUsers = async (numUsers: number) => {
  await connectMongoDB()

  for (let i = 0; i < numUsers; i++) {
    const user = {
      particleUUID: `particleUUID-${i + 1}`,
      wallets: generateRandomWallets(2), // Generate 2 random wallets for each user
      primaryWallet: `0x${Math.random().toString(16).slice(2, 42)}`,
      chosenPublicName: `mock user ${i + 1}`,
    }
    await UserV2Model.create(user)
    console.log(`created User: ${user.chosenPublicName}`)
  }
}

const numUsersToCreate = 10 // Change this number to create more or fewer users
createMockUsers(numUsersToCreate)
  .then(() => console.log('mock users created successfully'))
  .catch((error) => console.error('error creating mock users:', error))
