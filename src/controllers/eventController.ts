import { Request, Response } from 'express'
import prisma from '../config/client'
import { broadcast } from '../services/wsService'

export async function createEvent(req: Request, res: Response) {
  const { title, description, date, location } = req.body
  const user = (req as any).user
  if (!title || !date || !location) return res.status(400).json({ success: false, error: 'Missing fields' })

  const event = await prisma.event.create({ data: { title, description, date: new Date(date), location, createdById: user.id } })
  broadcast('event', { action: 'created', event })
  res.json({ success: true, data: event })
}

export async function getEvents(req: Request, res: Response) {
  const events = await prisma.event.findMany({ include: { rsvps: true } })
  res.json({ success: true, data: events })
}

export async function updateEvent(req: Request, res: Response) {
  const { id } = req.params
  const { title, description, date, location } = req.body
  const user = (req as any).user

  const existing = await prisma.event.findUnique({ where: { id: Number(id) } })
  if (!existing) return res.status(404).json({ success: false, error: 'Event not found' })
  if (existing.createdById !== user.id && user.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Forbidden' })

  const updated = await prisma.event.update({ where: { id: Number(id) }, data: { title, description, date: date ? new Date(date) : undefined, location } })
  broadcast('event', { action: 'updated', event: updated })
  res.json({ success: true, data: updated })
}

export async function deleteEvent(req: Request, res: Response) {
  const { id } = req.params
  const user = (req as any).user
  const existing = await prisma.event.findUnique({ where: { id: Number(id) } })
  if (!existing) return res.status(404).json({ success: false, error: 'Event not found' })
  if (existing.createdById !== user.id && user.role !== 'ADMIN') return res.status(403).json({ success: false, error: 'Forbidden' })

  await prisma.event.delete({ where: { id: Number(id) } })
  broadcast('event', { action: 'deleted', id: Number(id) })
  res.json({ success: true })
}
