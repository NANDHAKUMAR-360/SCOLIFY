import { Request, Response } from 'express';
import { opportunityService } from '../services/opportunityService.js';
import { opportunityQuerySchema } from '../validators/opportunityValidator.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getOpportunities = async (req: Request, res: Response) => {
  try {
    const parseResult = opportunityQuerySchema.safeParse(req.query);
    const filter = parseResult.success ? parseResult.data : {};

    const studentId = req.studentId;
    const category = (req.query.category as string) || filter.category;
    const search = req.query.search as string;
    const isRemote = req.query.isRemote ? req.query.isRemote === 'true' : undefined;

    const result = await opportunityService.getOpportunities({
      category,
      search,
      isRemote,
      verificationStatus: req.query.verificationStatus as string,
      page: filter.page ? parseInt(filter.page) : 1,
      limit: filter.limit ? parseInt(filter.limit) : 20,
      studentId,
    });

    return sendSuccess(res, result.items, 'Opportunities retrieved successfully', 200, {
      total: result.total,
      page: filter.page ? parseInt(filter.page) : 1,
    });
  } catch (error: any) {
    return sendError(res, 'OPPORTUNITIES_FETCH_ERROR', error.message || 'Failed to retrieve opportunities', 500);
  }
};

export const getOpportunityById = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const studentId = req.studentId;

    const item = await opportunityService.getOpportunityById(id, studentId);
    if (!item) {
      return sendError(res, 'NOT_FOUND', 'Opportunity not found', 404);
    }
    return sendSuccess(res, item, 'Opportunity details retrieved');
  } catch (error: any) {
    return sendError(res, 'OPPORTUNITY_FETCH_ERROR', error.message, 500);
  }
};

export const saveOpportunity = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const studentId = req.studentId;
    if (!studentId) {
      return sendError(res, 'STUDENT_PROFILE_REQUIRED', 'Please complete student profile onboarding first', 400);
    }

    const saved = await opportunityService.saveOpportunity(studentId, id);
    return sendSuccess(res, saved, 'Opportunity saved to your bookmarks');
  } catch (error: any) {
    return sendError(res, 'SAVE_ERROR', error.message, 500);
  }
};

export const unsaveOpportunity = async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const studentId = req.studentId;
    if (!studentId) {
      return sendError(res, 'STUDENT_PROFILE_REQUIRED', 'Please complete student profile onboarding first', 400);
    }

    await opportunityService.unsaveOpportunity(studentId, id);
    return sendSuccess(res, { opportunityId: id, isSaved: false }, 'Opportunity removed from bookmarks');
  } catch (error: any) {
    return sendError(res, 'UNSAVE_ERROR', error.message, 500);
  }
};

export const checkRawOpportunity = async (req: Request, res: Response) => {
  try {
    const checkResult = await opportunityService.normalizeAndValidateRawData(req.body);
    return sendSuccess(res, checkResult, 'Opportunity data normalized & checked');
  } catch (error: any) {
    return sendError(res, 'CHECK_ERROR', error.message, 500);
  }
};

export const adminVerifyOpportunity = async (req: Request, res: Response) => {
  try {
    // STRICT Server-side Authorization Check: Must possess genuine 'admin' role claim
    const userRole = req.user?.app_metadata?.role || req.user?.user_metadata?.role;
    const isAdmin = userRole === 'admin';

    if (!isAdmin) {
      return sendError(res, 'FORBIDDEN', 'Administrative authorization required to update verification status', 403);
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { verificationStatus, reasoning } = req.body;

    if (!verificationStatus) {
      return sendError(res, 'VALIDATION_ERROR', 'Verification status is required', 400);
    }

    const updated = await opportunityService.adminVerifyOpportunity(
      id,
      verificationStatus,
      reasoning || 'Admin verification update',
      req.user!.id
    );

    return sendSuccess(res, updated, `Opportunity status updated to ${verificationStatus}`);
  } catch (error: any) {
    return sendError(res, 'ADMIN_VERIFY_ERROR', error.message, 500);
  }
};
