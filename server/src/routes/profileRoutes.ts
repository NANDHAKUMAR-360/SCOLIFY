import { Router } from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import {
  getProfile,
  initializeProfile,
  updateProfile,
  getEducation,
  createEducation,
  deleteEducation,
  getSkills,
  createSkill,
  deleteSkill,
  getInterests,
  createInterest,
  deleteInterest,
  getCompletion
} from '../controllers/profileController.js';

const router = Router();

// Protect all profile endpoints with authentication middleware
router.use(authenticateUser);

router.get('/', getProfile);
router.post('/init', initializeProfile);
router.patch('/', updateProfile);

router.get('/education', getEducation);
router.post('/education', createEducation);
router.delete('/education/:id', deleteEducation);

router.get('/skills', getSkills);
router.post('/skills', createSkill);
router.delete('/skills/:id', deleteSkill);

router.get('/interests', getInterests);
router.post('/interests', createInterest);
router.delete('/interests/:id', deleteInterest);

router.get('/completion', getCompletion);

export default router;
