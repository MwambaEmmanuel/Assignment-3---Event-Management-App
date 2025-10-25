import { Router } from 'express'
import { register, login } from '../controllers/authController'

const router = Router()

router.post('/register', register)
router.post('/login', login)

export default router
import { Elysia, t } from 'elysia';
import { signup, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import { sendWelcomeEmail } from '../services/emailService';

export const authRoutes = new Elysia({ prefix: '/api/auth' })
  /**
   * POST /api/auth/signup - Register a new user
   */
  .post(
    '/signup',
    async ({ body }) => {
      const result = await signup(body);
      
      // Send welcome email (async, don't wait)
      sendWelcomeEmail(body.email, body.name).catch(console.error);
      
      return result;
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String({ minLength: 6 }),
        name: t.String({ minLength: 2 }),
        role: t.Optional(t.Union([
          t.Literal('ADMIN'),
          t.Literal('ORGANIZER'),
          t.Literal('ATTENDEE')
        ])),
      }),
      detail: {
        tags: ['Authentication'],
        summary: 'Register a new user',
        description: 'Create a new user account with email, password, and name',
      },
    }
  )

  /**
   * POST /api/auth/login - Login user
   */
  .post(
    '/login',
    async ({ body }) => {
      return await login(body);
    },
    {
      body: t.Object({
        email: t.String({ format: 'email' }),
        password: t.String(),
      }),
      detail: {
        tags: ['Authentication'],
        summary: 'Login user',
        description: 'Authenticate user and receive JWT token',
      },
    }
  )

  /**
   * GET /api/auth/profile - Get current user profile
   */
  .get(
    '/profile',
    async ({ headers }) => {
      const user = await authenticate({ headers });
      return await getProfile(user.userId);
    },
    {
      detail: {
        tags: ['Authentication'],
        summary: 'Get current user profile',
        description: 'Get the authenticated user\'s profile information',
        security: [{ bearerAuth: [] }],
      },
    }
  );
