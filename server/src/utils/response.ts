import { Response } from 'express';

export function sendSuccess<T = any>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  meta?: Record<string, any>
) {
  return res.status(statusCode).json({
    success: true,
    data,
    message: message || '',
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details: details || {},
    },
  });
}
