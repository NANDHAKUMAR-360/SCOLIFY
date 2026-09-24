import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`Unhandled API Error: ${err.message}`, err.stack);
  return sendError(
    res,
    err.code || 'INTERNAL_SERVER_ERROR',
    err.message || 'An unexpected error occurred on the server',
    err.status || 500,
    err.details || {}
  );
};
