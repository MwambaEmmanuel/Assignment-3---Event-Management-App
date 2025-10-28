import { Router } from 'express'
import { rsvp } from '../controllers/rsvpController'
import { authenticate } from '../middlewares/authMiddleware'

const router = Router()

router.post('/', authenticate, rsvp)

export default router
