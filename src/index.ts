import express from 'express'
import http from 'http'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

import authRoutes from './routes/auth.routes'
import eventRoutes from './routes/event.routes'
import rsvpRoutes from './routes/rsvp.routes'
import { errorHandler } from './utils/errorHandler'
import { initWebsocket } from './services/wsService'
import prisma from './config/client'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/rsvp', rsvpRoutes)

app.get('/', (req, res) => res.json({ success: true, message: 'Event Management API' }))

app.use(errorHandler)

const PORT = Number(process.env.PORT || 5000)
const server = http.createServer(app)

// initialize websocket server
initWebsocket(server)

server.listen(PORT, async () => {
  console.log(`Server listening on http://localhost:${PORT}`)
  // connect Prisma
  try {
    await prisma.$connect()
    console.log('Prisma connected')
  } catch (err) {
    console.error('Prisma connection error', err)
  }
})
