// Matching Controller – Phase D (API Endpoints)
import { Request, Response } from 'express';
import { matchEngineService } from '../services/matching/matchEngine.js';
import { matchResultsRepository } from '../repositories/matchResultsRepository.js';
import { formatMatchResultResponse } from '../types/matchResult.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logger } from '../utils/logger.js';

/**
 * POST /api/v1/match/:opportunityId
 * Executes deterministic match for the authenticated student and given opportunity.
 * Returns the full persisted match result structure.
 */
export const runMatch = async (req: Request, res: Response) => {
  try {
    const studentId = req.studentId;
    const userId = req.user?.id;
    const rawOppId = req.params.opportunityId;

    if (!userId || !studentId) {
      return sendError(res, 'UNAUTHORIZED', 'Student authentication required', 401);
    }

    if (!rawOppId || Array.isArray(rawOppId) || typeof rawOppId !== 'string' || !rawOppId.trim()) {
      return sendError(res, 'BAD_REQUEST', 'Invalid or missing opportunity ID', 400);
    }

    const opportunityId = rawOppId.trim();

    const result = await matchEngineService.runMatch(studentId, opportunityId, userId);
    const formatted = formatMatchResultResponse(result);

    return sendSuccess(res, formatted);
  } catch (err: any) {
    logger.error('Match engine execution error:', err);
    const message = err.message || 'Match processing failed';
    const status = message.includes('not found') ? 404 : message.includes('unavailable') ? 400 : 500;
    return sendError(res, 'MATCH_PROCESSING_ERROR', message, status);
  }
};

/**
 * GET /api/v1/match/latest/:opportunityId
 * Retrieves the latest persisted match result for the authenticated student.
 * Never accepts student_id from the frontend.
 */
export const getLatestMatch = async (req: Request, res: Response) => {
  try {
    const studentId = req.studentId;
    const rawOppId = req.params.opportunityId;

    if (!req.user || !studentId) {
      return sendError(res, 'UNAUTHORIZED', 'Student authentication required', 401);
    }

    if (!rawOppId || Array.isArray(rawOppId) || typeof rawOppId !== 'string' || !rawOppId.trim()) {
      return sendError(res, 'BAD_REQUEST', 'Invalid or missing opportunity ID', 400);
    }

    const opportunityId = rawOppId.trim();

    const result = await matchResultsRepository.getLatestMatchResult(studentId, opportunityId);
    if (!result) {
      return sendError(res, 'NOT_FOUND', 'No active match result found for this opportunity', 404);
    }

    const formatted = formatMatchResultResponse(result);
    return sendSuccess(res, formatted);
  } catch (err: any) {
    logger.error('Error retrieving latest match:', err);
    return sendError(res, 'MATCH_FETCH_ERROR', err.message || 'Failed to retrieve match result', 500);
  }
};
