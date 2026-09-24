import { Router } from 'express';
import { getDashboardSummary } from '../controllers/dashboardController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/v1/dashboard/summary
router.get('/summary', authenticateUser, getDashboardSummary);

export default router;
