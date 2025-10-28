import { Router } from 'express'
import { createEvent, getEvents, updateEvent, deleteEvent } from '../controllers/eventController'
import { authenticate, authorize } from '../middlewares/authMiddleware'

const router = Router()

router.get('/', getEvents)
router.post('/', authenticate, createEvent)
router.put('/:id', authenticate, updateEvent)
router.delete('/:id', authenticate, deleteEvent)

export default router
