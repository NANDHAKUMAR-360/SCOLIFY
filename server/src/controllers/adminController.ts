import { Request, Response } from 'express';
import { ingestionService } from '../services/ingestion/ingestionService.js';
import { ingestionRunService } from '../services/ingestion/ingestionRunService.js';
import { opportunityService } from '../services/opportunityService.js';
import { opportunityRepository } from '../repositories/opportunityRepository.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { verificationService } from '../services/ingestion/verificationService.js';
import { detectDuplicateStatus } from '../utils/duplicateDetector.js';
import { calculateExpiryStatus } from '../utils/expiryEngine.js';

// Helper to enforce server-side admin role check
function isServerAdmin(req: Request): boolean {
  const userRole = req.user?.app_metadata?.role || req.user?.user_metadata?.role;
  return userRole === 'admin';
}

export const ingestOpportunities = async (req: Request, res: Response) => {
  try {
    if (!isServerAdmin(req)) {
      return sendError(res, 'FORBIDDEN', 'Administrative authorization required to trigger ingestion', 403);
    }

    const { sourceType, payload, sourceName, sourceUrl } = req.body;
    const type = sourceType || 'DEMO';

    const result = await ingestionService.executeIngestion(
      type,
      payload,
      sourceName,
      sourceUrl,
      req.user?.id
    );

    return sendSuccess(res, result, 'Ingestion pipeline executed successfully', 201);
  } catch (error: any) {
    return sendError(res, 'INGESTION_ERROR', error.message || 'Ingestion pipeline execution failed', 500);
  }
};

export const getOpportunitiesForReview = async (req: Request, res: Response) => {
  try {
    if (!isServerAdmin(req)) {
      return sendError(res, 'FORBIDDEN', 'Administrative authorization required to access review catalog', 403);
    }

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

    const result = await opportunityRepository.queryOpportunities({
      includeUnpublished: true,
      verificationStatus: (req.query.status as string) || undefined,
      lifecycleStatus: (req.query.lifecycleStatus as string) || undefined,
      page,
      limit,
    });

    return sendSuccess(res, result.items, 'Review items retrieved', 200, {
      total: result.total,
      page,
    });
  } catch (error: any) {
    return sendError(res, 'REVIEW_LIST_ERROR', error.message, 500);
  }
};

export const getOpportunityVerificationDetails = async (req: Request, res: Response) => {
  try {
    if (!isServerAdmin(req)) {
      return sendError(res, 'FORBIDDEN', 'Administrative authorization required', 403);
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const opportunity = await opportunityService.getOpportunityById(id);

    if (!opportunity) {
      return sendError(res, 'NOT_FOUND', 'Opportunity not found', 404);
    }

    const { items: catalog } = await opportunityRepository.queryOpportunities({ includeUnpublished: true });
    const otherOpps = catalog.filter((o) => o.id !== id);

    const dupCheck = detectDuplicateStatus(opportunity, otherOpps);
    const expiryCheck = calculateExpiryStatus(opportunity.application_deadline);

    const sourceMeta = {
      sourceName: opportunity.sources?.[0]?.source_name || 'System Catalog',
      sourceUrl: opportunity.official_url || 'https://scolify.org',
      sourceType: (opportunity.sources?.[0]?.source_type as any) || 'MANUAL',
    };

    const evaluation = verificationService.evaluate(
      opportunity,
      sourceMeta,
      dupCheck.status,
      expiryCheck.status
    );

    return sendSuccess(res, {
      opportunity,
      verificationEvaluation: evaluation,
      duplicateCheck: dupCheck,
      expiryCheck,
      sourceProvenance: opportunity.sources || [],
    }, 'Opportunity verification details retrieved');
  } catch (error: any) {
    return sendError(res, 'VERIFICATION_DETAILS_ERROR', error.message, 500);
  }
};

export const adminVerifyOpportunityAction = async (req: Request, res: Response) => {
  try {
    if (!isServerAdmin(req)) {
      return sendError(res, 'FORBIDDEN', 'Administrative authorization required', 403);
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status, reasoning, lifecycleStatus } = req.body;

    if (!status) {
      return sendError(res, 'VALIDATION_ERROR', 'Verification status is required', 400);
    }

    const validStatuses = ['verified', 'partially_verified', 'unverified', 'warning', 'needs_review'];
    if (!validStatuses.includes(status)) {
      return sendError(res, 'INVALID_STATUS', `Status must be one of: ${validStatuses.join(', ')}`, 400);
    }

    // Determine target lifecycle status
    let targetLifecycle = lifecycleStatus;
    if (!targetLifecycle) {
      if (status === 'verified') targetLifecycle = 'published';
      else if (status === 'partially_verified') targetLifecycle = 'admin_review';
      else if (status === 'unverified' || status === 'warning') targetLifecycle = 'rejected';
      else targetLifecycle = 'admin_review';
    }

    const updated = await opportunityService.adminVerifyOpportunity(
      id,
      status,
      reasoning || 'Admin verification update',
      req.user!.id
    );

    // Explicitly update lifecycle if needed
    if (targetLifecycle) {
      await opportunityRepository.updateVerification(
        id,
        status,
        reasoning || 'Admin verification update',
        req.user!.id,
        targetLifecycle
      );
    }

    return sendSuccess(res, updated, `Opportunity verification status updated to ${status}`);
  } catch (error: any) {
    return sendError(res, 'ADMIN_VERIFY_ACTION_ERROR', error.message, 500);
  }
};

export const getIngestionRunStatus = async (req: Request, res: Response) => {
  try {
    if (!isServerAdmin(req)) {
      return sendError(res, 'FORBIDDEN', 'Administrative authorization required', 403);
    }

    const runId = Array.isArray(req.params.runId) ? req.params.runId[0] : req.params.runId;
    const run = await ingestionRunService.getRun(runId);

    if (!run) {
      return sendError(res, 'NOT_FOUND', `Ingestion run '${runId}' not found`, 404);
    }

    return sendSuccess(res, run, 'Ingestion run status retrieved');
  } catch (error: any) {
    return sendError(res, 'RUN_STATUS_ERROR', error.message, 500);
  }
};
