/* eslint-disable @typescript-eslint/no-floating-promises */
// import timeout from 'connect-timeout'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import config from 'config'
import express from 'express'
import { Server } from 'socket.io'

import { connectMongoDB } from './db/mongodb'
import { requestLogger, setCorrelationId } from './middleware'
import { routes } from './routes'
import { getFrontendURL } from './util/seoConstantsUtil'
import { decodeAuthToken } from './util/jwtTokenUtil'
import { createEmoteInDB } from './services/emote.service'
import { EMOTE_CONTEXTS } from './util/contextUtil'
import { UserTokenModel } from './models/user-token.model'

const app = express()

// Middlewares
app.use(cors())
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
  console.log(`Server listing at port ${port}`)
})

// socket.io setup
const io = new Server(server, {
  cors: {
    origin: getFrontendURL()
  }
})

interface UserDisconnectTimers {
  [userId: string]: NodeJS.Timeout;
}
const userDisconnectTimers: UserDisconnectTimers = {} // Data structure to store user disconnects based on their userID as key and a timer/timeout for the value that was created on disconnect. Good to store this bc then can cancel it if user reconnects before 10 minutes is up

// Listen for Socket.IO connections
// socket here is that one particular socket associated with that specific client/user

// on connect - we just check if there are any detected user disconnects for this user and if so, delete them so disconnect emote is not sent - bc if we just reconnected in such a short amount of time, no need to say we disconnected (at least that is reasoning rn)
io.on('connection', (socket) => {
  console.log('new user connected through socketio')

  const bearerHeaderValue = socket.handshake.auth.token
  const [, jwt] = bearerHeaderValue.split(' ')
  const userID = decodeAuthToken(jwt) as string
  if (userDisconnectTimers[userID]) {
    clearTimeout(userDisconnectTimers[userID]) // Cancel the timer if user reconnects
    delete userDisconnectTimers[userID]
  }

  // Listen for chat messages
  socket.on('chat message', (msg) => {
    console.log('Message: ' + msg)
    // Broadcast the message to all connected clients
    io.emit('chat message', msg)
  })

  socket.on("reconnect", () => {
    console.log('reconnect inside connection')
  })

  // Listen for disconnections - this is called by socketio itself in multiple scenarios - so, often triggered by not-our-code
  socket.on('disconnect', () => {
    console.log('a user disconnected from socketio')

    const bearerHeaderValue = socket.handshake.auth.token
    const [, jwt] = bearerHeaderValue.split(' ')
    const userID = decodeAuthToken(jwt) as string
    userDisconnectTimers[userID] = setTimeout(async () => {
      // If no new connection after 10 minutes, send emote saying this user is offline in parallel
      const userToken = await UserTokenModel.findById(userID)
      const requestData = {
        // NOTE: this could possibly be null is rare scenarios and causes issues - just remember
        senderTwitterUsername: userToken?.twitterUsername,
        receiverSymbols: [EMOTE_CONTEXTS.PARALLEL],
        sentSymbols: ['im offline'],
      }
      // createEmoteInDB(requestData)
      console.log('SENT EMOTE THAT USER IS NO LONGER ONLINE ON PARALLEL')
      delete userDisconnectTimers[userID]
    }, 30000) // 600000 is 10 minutes in milliseconds - so function is called 10 minutes after socketio disconnect
  })
})

io.on("reconnect", () => {
  console.log('reconnect outside connection')
})
