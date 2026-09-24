// Recommendation Routes – Phase G
import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendationController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/v1/recommendations – strictly authenticated student recommendations
router.get('/', authenticateUser, getRecommendations);

export default router;
