import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';

export const getHealthStatus = (req: Request, res: Response) => {
  return sendSuccess(
    res,
    {
      status: 'UP',
      product: 'Scolify API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    },
    'Scolify Backend Foundation Operational'
  );
};
