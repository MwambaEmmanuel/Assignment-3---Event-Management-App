import { Request, Response, NextFunction } from 'express'

// Centralized error handler middleware for Express
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err)
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'
  res.status(status).json({ success: false, error: message })
}
/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Error handler middleware for Elysia
 */
export const errorHandler = (error: Error) => {
  console.error('Error:', error);

  if (error instanceof APIError) {
    return {
      success: false,
      error: error.message,
      details: error.details,
      statusCode: error.statusCode,
    };
  }

  // Handle Prisma errors
  if (error.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as any;
    
    if (prismaError.code === 'P2002') {
      return {
        success: false,
        error: 'A record with this value already exists',
        statusCode: 409,
      };
    }
    
    if (prismaError.code === 'P2025') {
      return {
        success: false,
        error: 'Record not found',
        statusCode: 404,
      };
    }
  }

  // Default error response
  return {
    success: false,
    error: 'Internal server error',
    statusCode: 500,
  };
};

/**
 * Validation error helper
 */
export const validationError = (message: string, details?: any) => {
  return new APIError(400, message, details);
};

/**
 * Not found error helper
 */
export const notFoundError = (resource: string) => {
  return new APIError(404, `${resource} not found`);
};

/**
 * Unauthorized error helper
 */
export const unauthorizedError = (message: string = 'Unauthorized') => {
  return new APIError(401, message);
};

/**
 * Forbidden error helper
 */
export const forbiddenError = (message: string = 'Forbidden') => {
  return new APIError(403, message);
};
