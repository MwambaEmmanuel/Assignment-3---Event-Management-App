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
import { prisma } from '../prisma/client';
import { APIError, notFoundError, forbiddenError, validationError } from '../utils/errorHandler';
import { broadcastEvent } from '../services/wsService';

/**
 * Get all events
 */
export const getAllEvents = async (filters?: {
  upcoming?: boolean;
  organizerId?: string;
}) => {
  const where: any = {};

  if (filters?.upcoming) {
    where.date = {
      gte: new Date(),
    };
  }

  if (filters?.organizerId) {
    where.organizerId = filters.organizerId;
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      rsvps: {
        select: {
          id: true,
          status: true,
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  return {
    success: true,
    data: events,
  };
};

/**
 * Get event by ID
 */
export const getEventById = async (eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      rsvps: {
        select: {
          id: true,
          status: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });

  if (!event) {
    throw notFoundError('Event');
  }

  return {
    success: true,
    data: event,
  };
};

/**
 * Create a new event
 */
export const createEvent = async (
  data: {
    title: string;
    description?: string;
    date: string;
    location: string;
  },
  userId: string
) => {
  const { title, description, date, location } = data;

  // Validate input
  if (!title || !date || !location) {
    throw validationError('Title, date, and location are required');
  }

  // Validate date
  const eventDate = new Date(date);
  if (isNaN(eventDate.getTime())) {
    throw validationError('Invalid date format');
  }

  if (eventDate < new Date()) {
    throw validationError('Event date must be in the future');
  }

  // Create event
  const event = await prisma.event.create({
    data: {
      title,
      description,
      date: eventDate,
      location,
      organizerId: userId,
    },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Broadcast event creation via WebSocket
  broadcastEvent('event:created', event);

  return {
    success: true,
    message: 'Event created successfully',
    data: event,
  };
};

/**
 * Update an event
 */
export const updateEvent = async (
  eventId: string,
  data: {
    title?: string;
    description?: string;
    date?: string;
    location?: string;
  },
  userId: string,
  userRole: string
) => {
  // Find event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw notFoundError('Event');
  }

  // Check authorization
  if (event.organizerId !== userId && userRole !== 'ADMIN') {
    throw forbiddenError('You can only update your own events');
  }

  // Validate date if provided
  let eventDate;
  if (data.date) {
    eventDate = new Date(data.date);
    if (isNaN(eventDate.getTime())) {
      throw validationError('Invalid date format');
    }
  }

  // Update event
  const updatedEvent = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(eventDate && { date: eventDate }),
      ...(data.location && { location: data.location }),
    },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Broadcast event update via WebSocket
  broadcastEvent('event:updated', updatedEvent);

  return {
    success: true,
    message: 'Event updated successfully',
    data: updatedEvent,
  };
};

/**
 * Delete an event
 */
export const deleteEvent = async (
  eventId: string,
  userId: string,
  userRole: string
) => {
  // Find event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw notFoundError('Event');
  }

  // Check authorization (only admin can delete any event)
  if (userRole !== 'ADMIN') {
    throw forbiddenError('Only admins can delete events');
  }

  // Delete event (cascade will delete RSVPs)
  await prisma.event.delete({
    where: { id: eventId },
  });

  // Broadcast event deletion via WebSocket
  broadcastEvent('event:deleted', { id: eventId });

  return {
    success: true,
    message: 'Event deleted successfully',
  };
};
