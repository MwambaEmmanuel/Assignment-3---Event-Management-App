import { Router } from 'express'
import { createEvent, getEvents, updateEvent, deleteEvent } from '../controllers/eventController'
import { authenticate, authorize } from '../middlewares/authMiddleware'

const router = Router()

router.get('/', getEvents)
router.post('/', authenticate, createEvent)
router.put('/:id', authenticate, updateEvent)
router.delete('/:id', authenticate, deleteEvent)

export default router
import { Elysia, t } from 'elysia';
import {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController';
import { authenticate } from '../middleware/authMiddleware';

export const eventRoutes = new Elysia({ prefix: '/api/events' })
  /**
   * GET /api/events - Get all events
   */
  .get(
    '/',
    async ({ query }) => {
      return await getAllEvents({
        upcoming: query.upcoming === 'true',
        organizerId: query.organizerId,
      });
    },
    {
      query: t.Object({
        upcoming: t.Optional(t.String()),
        organizerId: t.Optional(t.String()),
      }),
      detail: {
        tags: ['Events'],
        summary: 'Get all events',
        description: 'Retrieve all events with optional filters',
      },
    }
  )

  /**
   * GET /api/events/:id - Get event by ID
   */
  .get(
    '/:id',
    async ({ params }) => {
      return await getEventById(params.id);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Events'],
        summary: 'Get event by ID',
        description: 'Retrieve a specific event by its ID',
      },
    }
  )

  /**
   * POST /api/events - Create a new event
   */
  .post(
    '/',
    async ({ body, headers }) => {
      const user = await authenticate({ headers });
      
      // Check if user is organizer or admin
      if (user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
        throw new Error('Only organizers and admins can create events');
      }

      return await createEvent(body, user.userId);
    },
    {
      body: t.Object({
        title: t.String({ minLength: 3 }),
        description: t.Optional(t.String()),
        date: t.String(),
        location: t.String({ minLength: 3 }),
      }),
      detail: {
        tags: ['Events'],
        summary: 'Create a new event',
        description: 'Create a new event (Organizer/Admin only)',
        security: [{ bearerAuth: [] }],
      },
    }
  )

  /**
   * PUT /api/events/:id - Update an event
   */
  .put(
    '/:id',
    async ({ params, body, headers }) => {
      const user = await authenticate({ headers });
      
      // Check if user is organizer or admin
      if (user.role !== 'ORGANIZER' && user.role !== 'ADMIN') {
        throw new Error('Only organizers and admins can update events');
      }

      return await updateEvent(params.id, body, user.userId, user.role);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 3 })),
        description: t.Optional(t.String()),
        date: t.Optional(t.String()),
        location: t.Optional(t.String({ minLength: 3 })),
      }),
      detail: {
        tags: ['Events'],
        summary: 'Update an event',
        description: 'Update an existing event (Organizer/Admin only)',
        security: [{ bearerAuth: [] }],
      },
    }
  )

  /**
   * DELETE /api/events/:id - Delete an event
   */
  .delete(
    '/:id',
    async ({ params, headers }) => {
      const user = await authenticate({ headers });
      
      // Check if user is admin
      if (user.role !== 'ADMIN') {
        throw new Error('Only admins can delete events');
      }

      return await deleteEvent(params.id, user.userId, user.role);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['Events'],
        summary: 'Delete an event',
        description: 'Delete an event (Admin only)',
        security: [{ bearerAuth: [] }],
      },
    }
  );
