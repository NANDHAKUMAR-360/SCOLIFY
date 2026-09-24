import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../integrations/supabaseClient.js';
import { sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'UNAUTHORIZED', 'Missing or invalid Authorization header', 401);
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return sendError(res, 'UNAUTHORIZED', 'Bearer token missing', 401);
  }

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      logger.warn('Authentication token verification failed', error);
      return sendError(res, 'UNAUTHORIZED', 'Invalid or expired authentication token', 401);
    }

    req.user = user;

    // Fetch corresponding canonical student ID for student-specific flows
    const { data: student } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (student) {
      req.studentId = student.id;
    } else {
      // Auto-resolve or create student row if first time
      const { data: newStudent } = await supabaseAdmin
        .from('students')
        .insert({
          profile_id: user.id,
          completion_percentage: 0,
        })
        .select('id')
        .maybeSingle();

      if (newStudent) {
        req.studentId = newStudent.id;
      }
    }

    return next();
  } catch (err: any) {
    logger.error('Authentication middleware error', err);
    return sendError(res, 'AUTH_ERROR', 'Failed to authenticate request', 500);
  }
};

export const requireAuth = authenticateUser;
export type AuthenticatedRequest = Request;

