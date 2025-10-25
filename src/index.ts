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
import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { authRoutes } from './routes/auth.routes';
import { eventRoutes } from './routes/event.routes';
import { rsvpRoutes } from './routes/rsvp.routes';
import { addClient, removeClient, sendToClient } from './services/wsService';
import { errorHandler } from './utils/errorHandler';

const PORT = process.env.PORT || 3000;

/**
 * Main Elysia application
 */
const app = new Elysia()
  // Add CORS support
  .use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  )

  // Add Swagger documentation
  .use(
    swagger({
      documentation: {
        info: {
          title: 'Event Management API',
          version: '1.0.0',
          description: 'A monolith event management application with authentication, real-time updates, and RSVP functionality',
        },
        tags: [
          { name: 'Authentication', description: 'User authentication endpoints' },
          { name: 'Events', description: 'Event management endpoints' },
          { name: 'RSVPs', description: 'RSVP management endpoints' },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
              description: 'Enter your JWT token',
            },
          },
        },
      },
      path: '/swagger',
    })
  )

  // Health check endpoint
  .get('/', () => ({
    success: true,
    message: 'Event Management API is running',
    version: '1.0.0',
    endpoints: {
      swagger: '/swagger',
      auth: '/api/auth',
      events: '/api/events',
      rsvps: '/api/rsvps',
      websocket: '/ws',
    },
  }))

  // Health check endpoint
  .get('/health', () => ({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  }))

  // WebSocket endpoint for real-time updates
  .ws('/ws', {
    open(ws) {
      addClient(ws);
      sendToClient(ws, 'connected', {
        message: 'Connected to Event Management WebSocket',
      });
    },
    message(ws, message) {
      console.log('Received message:', message);
      // Echo back for testing
      sendToClient(ws, 'echo', { message });
    },
    close(ws) {
      removeClient(ws);
    },
  })

  // Register route groups
  .use(authRoutes)
  .use(eventRoutes)
  .use(rsvpRoutes)

  // Global error handler
  .onError(({ error, set }) => {
    const response = errorHandler(error);
    set.status = response.statusCode || 500;
    return response;
  })

  // Start server
  .listen(PORT);

console.log('🚀 Event Management Server is running!');
console.log(`📡 Server: http://localhost:${PORT}`);
console.log(`📚 Swagger Docs: http://localhost:${PORT}/swagger`);
console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
console.log(`\n⚡ Environment: ${process.env.NODE_ENV || 'development'}`);

export default app;
export type App = typeof app;
