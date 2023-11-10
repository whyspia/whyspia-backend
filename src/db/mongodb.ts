/* eslint-disable unicorn/no-process-exit */
import config from 'config'
import { connect } from 'mongoose'

import { logger } from '../lib/logger'

async function connectMongoDB() {
  const mongoURI: string = config.get('mongodb.uri')

  try {
    await connect(mongoURI)
    logger.info('Database connected...')
    console.log('Database connected...')
  } catch (error) {
    logger.error('DB connection error', error)
    console.log(error)
    process.exit(1)
  }
}

export { connectMongoDB }
