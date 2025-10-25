import { Context } from 'elysia';
import { extractToken, verifyToken } from '../utils/jwtUtils';
import { unauthorizedError, forbiddenError } from '../utils/errorHandler';

/**
 * Authenticate middleware - Verify JWT token
 */
export const authenticate = async ({ headers, set }: any) => {
  const authHeader = headers.authorization || headers.Authorization;
  const token = extractToken(authHeader);

  if (!token) {
    throw unauthorizedError('No token provided');
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    throw unauthorizedError('Invalid or expired token');
  }

  // Attach user data to request context
  return decoded;
};

/**
 * Authorize middleware - Check user role
 */
export const authorize = (...allowedRoles: string[]) => {
  return (user: any) => {
    if (!user) {
      throw unauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(user.role)) {
      throw forbiddenError('You do not have permission to perform this action');
    }

    return user;
  };
};

/**
 * Check if user is admin
 */
export const isAdmin = (user: any) => {
  return authorize('ADMIN')(user);
};

/**
 * Check if user is organizer or admin
 */
export const isOrganizerOrAdmin = (user: any) => {
  return authorize('ORGANIZER', 'ADMIN')(user);
};

/**
 * Check if user is authenticated (any role)
 */
export const isAuthenticated = (user: any) => {
  if (!user) {
    throw unauthorizedError('Authentication required');
  }
  return user;
};
