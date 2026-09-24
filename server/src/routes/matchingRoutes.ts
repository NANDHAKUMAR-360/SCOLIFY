// Matching Routes – Phase D endpoints
import { Router } from 'express';
import { runMatch, getLatestMatch } from '../controllers/matchingController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/v1/match/latest/:opportunityId – retrieve latest match for authenticated student
router.get('/latest/:opportunityId', authenticateUser, getLatestMatch);

// POST /api/v1/match/:opportunityId – calculate/recalculate deterministic match for authenticated student
router.post('/:opportunityId', authenticateUser, runMatch);

export default router;
