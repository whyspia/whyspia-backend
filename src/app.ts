/* eslint-disable @typescript-eslint/no-floating-promises */
// import timeout from 'connect-timeout'
import cors, { CorsOptions } from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import config from 'config'
import express from 'express'
import { Server } from 'socket.io'

import { connectMongoDB } from './db/mongodb'
import { requestLogger, setCorrelationId } from './middleware'
import { routes } from './routes'
import { createVibecampTopicInDB, deleteVibecampTopicFromDB } from './services/vibecamp-topic.service'

const CLIENT_HOST_DOMAIN = config.get<string>('client.hostDomain')

const app = express()

const allowedOriginPattern = new RegExp(`^https:\/\/(\\w+\\.)?${CLIENT_HOST_DOMAIN.replace('.', '\\.')}$`)

const allowedOrigins = [allowedOriginPattern, "http://localhost:3000"]

const corsOptions: CorsOptions = {
  origin: function (origin: any, callback: any) {
    if (allowedOrigins.some(pattern => pattern instanceof RegExp ? pattern.test(origin) : pattern === origin) || !origin) {
      callback(null, true)
    } else {
      callback(new Error(`${origin} not allowed by CORS`))
    }
  },
  credentials: CLIENT_HOST_DOMAIN.includes('localhost') || CLIENT_HOST_DOMAIN.includes('whyspia.com'),
}

// Middlewares
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(setCorrelationId)
app.use(requestLogger)
// app.use(timeout(86_400_000)) // Use this for debugging. By default request will timeout after 5 minutes. This increases that timeout. 1 hour = 3,600,000 ms

// MongoDB
connectMongoDB()

// Routers
app.use(routes)

const port: number = config.get('server.port')
const server = app.listen(port, () => {
  console.log(`Server listening at port ${port}`)
})

// Initialize Socket.IO with the existing server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: CLIENT_HOST_DOMAIN.includes('localhost') || CLIENT_HOST_DOMAIN.includes('whyspia.com'),
  }
})

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('Client connected')

  socket.on('disconnect', () => {
    console.log('Client disconnected')
  })

  // Handle new topic creation
  socket.on('newTopic', async (topic) => {
    try {
      // Save topic to database
      const savedTopic = await createVibecampTopicInDB(topic)
      // Broadcast the new topic to all connected clients
      io.emit('topicCreated', savedTopic)
    } catch (error) {
      console.error('Error saving topic:', error)
      socket.emit('error', 'Failed to save topic')
    }
  })

  // Handle topic deletion
  socket.on('deleteTopic', async (topicId) => {
    try {
      // Delete topic from database
      const deletedTopic = await deleteVibecampTopicFromDB(topicId)
      if (deletedTopic) {
        // Broadcast the deleted topic ID to all connected clients
        io.emit('topicDeleted', topicId)
      } else {
        socket.emit('error', 'Topic not found')
      }
    } catch (error) {
      console.error('Error deleting topic:', error)
      socket.emit('error', 'Failed to delete topic')
    }
  })
})


