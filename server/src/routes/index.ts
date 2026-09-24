import { Router } from 'express';
import { getHealthStatus } from '../controllers/healthController.js';
import { orchestrateAgent } from '../controllers/aiController.js';
import profileRoutes from './profileRoutes.js';
import opportunityRoutes from './opportunityRoutes.js';
import adminRoutes from './adminRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import matchingRoutes from './matchingRoutes.js';
import recommendationRoutes from './recommendationRoutes.js';
import documentRoutes from './documentRoutes.js';
import applicationRoutes from './applicationRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', getHealthStatus);

// Dashboard Aggregation Endpoints (/api/v1/dashboard)
router.use('/dashboard', dashboardRoutes);

// Profile & Student Identity Endpoints (/api/v1/profile)
router.use('/profile', profileRoutes);

// Shared Opportunity Intelligence Endpoints (/api/v1/opportunities)
router.use('/opportunities', opportunityRoutes);
router.use('/match', matchingRoutes);
router.use('/recommendations', recommendationRoutes);

// Document Intelligence Vault Endpoints (/api/v1/documents)
router.use('/documents', documentRoutes);

// Application Preparation & Human Approval Endpoints (/api/v1/applications)
router.use('/applications', applicationRoutes);


// Scholarships & Internships type specific alias routes
router.use('/scholarships', (req, res, next) => {
  req.query.category = 'scholarship';
  return opportunityRoutes(req, res, next);
});

router.use('/internships', (req, res, next) => {
  req.query.category = 'internship';
  return opportunityRoutes(req, res, next);
});

// Admin Verification Endpoints (/api/v1/admin)
router.use('/admin', adminRoutes);

// AI Agent Orchestration endpoints
router.post('/agents/orchestrate', orchestrateAgent);

export default router;
