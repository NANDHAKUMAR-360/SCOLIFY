import { Router } from 'express';
import {
  getOpportunities,
  getOpportunityById,
  saveOpportunity,
  unsaveOpportunity,
  checkRawOpportunity,
} from '../controllers/opportunityController.js';
import { getOpportunityEligibility } from '../controllers/eligibilityController.js';
import { documentController } from '../controllers/documentController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// Public / Authenticated Student Discovery Routes
router.get('/', getOpportunities);
router.get('/:id', getOpportunityById);
router.post('/check-raw', checkRawOpportunity);

// Protected Eligibility & Bookmark Actions
router.get('/:id/eligibility', authenticateUser, getOpportunityEligibility);
router.post('/:id/save', authenticateUser, saveOpportunity);
router.delete('/:id/save', authenticateUser, unsaveOpportunity);

// Document Intelligence & Readiness Endpoints (Part 07)
router.get('/:opportunityId/documents/gap', authenticateUser, (req, res) =>
  documentController.getDocumentGap(req, res)
);
router.get('/:opportunityId/documents/guidance', authenticateUser, (req, res) =>
  documentController.getCertificateGuidance(req, res)
);
router.get('/:opportunityId/readiness', authenticateUser, (req, res) =>
  documentController.getApplicationReadiness(req, res)
);

export default router;

