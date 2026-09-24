import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { applicationPreparationController } from '../controllers/applicationPreparationController.js';

const router = Router();

// All application preparation routes require authentication
router.use(requireAuth);

router.get('/', (req, res) => applicationPreparationController.getStudentApplications(req, res));
router.get('/:applicationId', (req, res) => applicationPreparationController.getApplicationById(req, res));
router.post('/prepare', (req, res) => applicationPreparationController.prepareApplication(req, res));
router.post('/:applicationId/documents', (req, res) => applicationPreparationController.attachDocument(req, res));
router.delete('/:applicationId/documents/:documentId', (req, res) =>
  applicationPreparationController.detachDocument(req, res)
);
router.post('/:applicationId/draft/:draftType', (req, res) =>
  applicationPreparationController.generateAIDraft(req, res)
);
router.put('/:applicationId/draft', (req, res) =>
  applicationPreparationController.updateDraftContent(req, res)
);
router.put('/:applicationId/approve', (req, res) =>
  applicationPreparationController.approveApplication(req, res)
);

export default router;
