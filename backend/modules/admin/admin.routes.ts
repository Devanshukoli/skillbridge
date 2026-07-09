import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middlewares/auth';
import { adminController } from './admin.controller';

const router = Router();

// Ensure all routes are admin-protected
router.use(authenticate, requireAdmin);

// User Management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);

// CMS: Tracks
router.post('/tracks', adminController.createTrack);
router.put('/tracks/:id', adminController.updateTrack);
router.delete('/tracks/:id', adminController.deleteTrack);

// CMS: Modules
router.post('/modules', adminController.createModule);
router.put('/modules/:id', adminController.updateModule);
router.delete('/modules/:id', adminController.deleteModule);

// CMS: Lessons
router.post('/lessons', adminController.createLesson);
router.put('/lessons/:id', adminController.updateLesson);
router.delete('/lessons/:id', adminController.deleteLesson);

// CMS: Projects
router.post('/projects', adminController.createProject);
router.put('/projects/:id', adminController.updateProject);
router.delete('/projects/:id', adminController.deleteProject);

// Submissions History
router.get('/submissions/:id/history', adminController.getSubmissionHistory);

export default router;
