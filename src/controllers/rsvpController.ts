import { Request, Response } from 'express'
import prisma from '../config/client'
import { sendEmail } from '../services/emailService'
import { broadcast } from '../services/wsService'

// payload: { eventId, status }
export async function rsvp(req: Request, res: Response) {
  const user = (req as any).user
  const { eventId, status } = req.body
  if (!eventId || !status) return res.status(400).json({ success: false, error: 'Missing fields' })

  // prevent duplicates by upserting
  let record = await prisma.rSVP.findUnique({ where: { userId_eventId: { userId: user.id, eventId: Number(eventId) } } }).catch(() => null)

  if (record) {
    record = await prisma.rSVP.update({ where: { id: record.id }, data: { status } })
  } else {
    record = await prisma.rSVP.create({ data: { userId: user.id, eventId: Number(eventId), status } })
  }

  // notify event creator by email
  const event = await prisma.event.findUnique({ where: { id: Number(eventId) }, include: { createdBy: true } })
  if (event && event.createdBy && event.createdBy.email) {
    try {
      await sendEmail(event.createdBy.email, `New RSVP for ${event.title}`, `${user.email} responded ${status} to your event.`)
    } catch (err) {
      console.error('Failed to send RSVP email', err)
    }
  }

  broadcast('rsvp', { action: 'updated', rsvp: record })
  res.json({ success: true, data: record })
}
