// Recommendation Controller – Phase G (API Endpoint)
import { Request, Response } from 'express';
import { recommendationService } from '../services/recommendationService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * GET /api/v1/recommendations
 * Authenticated student endpoint.
 * Returns verified, unexpired, published opportunities where the student is ELIGIBLE,
 * ranked strictly by deterministic match score.
 */
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const studentId = req.studentId;

    if (!userId || !studentId) {
      return sendError(res, 'UNAUTHORIZED', 'Student authentication required', 401);
    }

    const limitQuery = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const limit = Math.max(1, Math.min(limitQuery || 10, 50));

    const recommendations = await recommendationService.getRecommendations(userId, studentId, limit);

    return sendSuccess(res, recommendations);
  } catch (err: any) {
    logger.error('Error fetching student recommendations:', err);
    return sendError(res, 'RECOMMENDATION_ERROR', err.message || 'Failed to generate recommendations', 500);
  }
};
