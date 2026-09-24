import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { documentController } from '../controllers/documentController.js';

const router = Router();

// All document routes require authentication
router.use(requireAuth);

// Student Document Vault CRUD
router.get('/', (req, res) => documentController.getStudentDocuments(req, res));
router.post('/', (req, res) => documentController.createDocument(req, res));
router.delete('/:documentId', (req, res) => documentController.deleteDocument(req, res));
router.get('/:documentId/signed-url', (req, res) => documentController.getDocumentSignedUrl(req, res));

export default router;
