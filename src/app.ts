/* eslint-disable @typescript-eslint/no-floating-promises */
// import timeout from 'connect-timeout'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
import config from 'config'
import express from 'express'

import { connectMongoDB } from './db/mongodb'
import { requestLogger, setCorrelationId } from './middleware'
import { routes } from './routes'

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
app.listen(port, () => {
  console.log(`Server listing at port ${port}`)
})
