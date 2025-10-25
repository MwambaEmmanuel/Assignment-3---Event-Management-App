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
import { prisma } from '../prisma/client';
import { APIError, notFoundError, validationError } from '../utils/errorHandler';
import { broadcastEvent } from '../services/wsService';

/**
 * Get RSVPs for an event
 */
export const getEventRSVPs = async (eventId: string) => {
  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw notFoundError('Event');
  }

  const rsvps = await prisma.rSVP.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Count RSVPs by status
  const stats = {
    going: rsvps.filter(r => r.status === 'GOING').length,
    maybe: rsvps.filter(r => r.status === 'MAYBE').length,
    notGoing: rsvps.filter(r => r.status === 'NOT_GOING').length,
    total: rsvps.length,
  };

  return {
    success: true,
    data: {
      rsvps,
      stats,
    },
  };
};

/**
 * Create or update RSVP for an event
 */
export const createOrUpdateRSVP = async (
  eventId: string,
  userId: string,
  status: 'GOING' | 'MAYBE' | 'NOT_GOING'
) => {
  // Validate status
  if (!['GOING', 'MAYBE', 'NOT_GOING'].includes(status)) {
    throw validationError('Invalid RSVP status');
  }

  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw notFoundError('Event');
  }

  // Check if event has already passed
  if (event.date < new Date()) {
    throw validationError('Cannot RSVP to past events');
  }

  // Check if RSVP already exists
  const existingRSVP = await prisma.rSVP.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  let rsvp;
  let message;

  if (existingRSVP) {
    // Update existing RSVP
    rsvp = await prisma.rSVP.update({
      where: { id: existingRSVP.id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
    });
    message = 'RSVP updated successfully';
  } else {
    // Create new RSVP
    rsvp = await prisma.rSVP.create({
      data: {
        userId,
        eventId,
        status,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            date: true,
          },
        },
      },
    });
    message = 'RSVP created successfully';
  }

  // Broadcast RSVP update via WebSocket
  broadcastEvent('rsvp:updated', {
    eventId,
    rsvp: {
      id: rsvp.id,
      status: rsvp.status,
      user: rsvp.user,
    },
  });

  return {
    success: true,
    message,
    data: rsvp,
  };
};

/**
 * Get user's RSVPs
 */
export const getUserRSVPs = async (userId: string) => {
  const rsvps = await prisma.rSVP.findMany({
    where: { userId },
    include: {
      event: {
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      event: {
        date: 'asc',
      },
    },
  });

  return {
    success: true,
    data: rsvps,
  };
};

/**
 * Delete RSVP
 */
export const deleteRSVP = async (rsvpId: string, userId: string) => {
  // Find RSVP
  const rsvp = await prisma.rSVP.findUnique({
    where: { id: rsvpId },
  });

  if (!rsvp) {
    throw notFoundError('RSVP');
  }

  // Check authorization
  if (rsvp.userId !== userId) {
    throw new APIError(403, 'You can only delete your own RSVPs');
  }

  // Delete RSVP
  await prisma.rSVP.delete({
    where: { id: rsvpId },
  });

  // Broadcast RSVP deletion via WebSocket
  broadcastEvent('rsvp:deleted', {
    eventId: rsvp.eventId,
    rsvpId,
    userId,
  });

  return {
    success: true,
    message: 'RSVP deleted successfully',
  };
};
