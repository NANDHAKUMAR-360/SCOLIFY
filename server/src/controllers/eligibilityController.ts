import { Request, Response } from 'express';
import { eligibilityService } from '../services/eligibility/eligibilityService.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getOpportunityEligibility = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return sendError(res, 'UNAUTHORIZED', 'Authentication required', 401);
    }

    const opportunityId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const includeAi = req.query.aiExplanation !== 'false';

    const result = await eligibilityService.evaluateStudentEligibility(userId, opportunityId, includeAi);

    return sendSuccess(res, result, 'Deterministic eligibility evaluated successfully');
  } catch (error: any) {
    if (error.message.includes('not active, verified, or published')) {
      return sendError(res, 'UNTRUSTED_OPPORTUNITY', error.message, 403);
    }
    if (error.message.includes('not found')) {
      return sendError(res, 'NOT_FOUND', error.message, 404);
    }
    return sendError(res, 'ELIGIBILITY_EVALUATION_ERROR', error.message || 'Failed to evaluate eligibility', 500);
  }
};
