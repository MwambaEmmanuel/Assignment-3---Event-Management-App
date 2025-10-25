import { Router } from 'express'
import { rsvp } from '../controllers/rsvpController'
import { authenticate } from '../middlewares/authMiddleware'

const router = Router()

router.post('/', authenticate, rsvp)

export default router
import { Elysia, t } from 'elysia';
import {
  getEventRSVPs,
  createOrUpdateRSVP,
  getUserRSVPs,
  deleteRSVP,
} from '../controllers/rsvpController';
import { authenticate } from '../middleware/authMiddleware';

export const rsvpRoutes = new Elysia({ prefix: '/api' })
  /**
   * GET /api/events/:eventId/rsvps - Get all RSVPs for an event
   */
  .get(
    '/events/:eventId/rsvps',
    async ({ params }) => {
      return await getEventRSVPs(params.eventId);
    },
    {
      params: t.Object({
        eventId: t.String(),
      }),
      detail: {
        tags: ['RSVPs'],
        summary: 'Get event RSVPs',
        description: 'Get all RSVPs for a specific event',
      },
    }
  )

  /**
   * POST /api/events/:eventId/rsvp - Create or update RSVP for an event
   */
  .post(
    '/events/:eventId/rsvp',
    async ({ params, body, headers }) => {
      const user = await authenticate({ headers });
      return await createOrUpdateRSVP(params.eventId, user.userId, body.status);
    },
    {
      params: t.Object({
        eventId: t.String(),
      }),
      body: t.Object({
        status: t.Union([
          t.Literal('GOING'),
          t.Literal('MAYBE'),
          t.Literal('NOT_GOING'),
        ]),
      }),
      detail: {
        tags: ['RSVPs'],
        summary: 'RSVP to an event',
        description: 'Create or update your RSVP status for an event',
        security: [{ bearerAuth: [] }],
      },
    }
  )

  /**
   * GET /api/rsvps/my - Get current user's RSVPs
   */
  .get(
    '/rsvps/my',
    async ({ headers }) => {
      const user = await authenticate({ headers });
      return await getUserRSVPs(user.userId);
    },
    {
      detail: {
        tags: ['RSVPs'],
        summary: 'Get my RSVPs',
        description: 'Get all RSVPs for the authenticated user',
        security: [{ bearerAuth: [] }],
      },
    }
  )

  /**
   * DELETE /api/rsvps/:id - Delete an RSVP
   */
  .delete(
    '/rsvps/:id',
    async ({ params, headers }) => {
      const user = await authenticate({ headers });
      return await deleteRSVP(params.id, user.userId);
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['RSVPs'],
        summary: 'Delete RSVP',
        description: 'Cancel your RSVP to an event',
        security: [{ bearerAuth: [] }],
      },
    }
  );
