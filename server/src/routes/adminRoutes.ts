import { Router } from 'express';
import {
  ingestOpportunities,
  getOpportunitiesForReview,
  getOpportunityVerificationDetails,
  adminVerifyOpportunityAction,
  getIngestionRunStatus,
} from '../controllers/adminController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// All administrative endpoints require authentication & server-side admin role check
router.use(authenticateUser);

// 1. Ingest Opportunities (POST /api/v1/admin/opportunities/ingest)
router.post('/opportunities/ingest', ingestOpportunities);

// 2. Review List (GET /api/v1/admin/opportunities/review)
router.get('/opportunities/review', getOpportunitiesForReview);

// 3. Verification Details Inspection (GET /api/v1/admin/opportunities/:id/verification)
router.get('/opportunities/:id/verification', getOpportunityVerificationDetails);

// 4. Admin Verification Action (PATCH /api/v1/admin/opportunities/:id/verification)
router.patch('/opportunities/:id/verification', adminVerifyOpportunityAction);

// 5. Ingestion Run Tracking (GET /api/v1/admin/ingestion/runs/:runId)
router.get('/ingestion/runs/:runId', getIngestionRunStatus);

export default router;
