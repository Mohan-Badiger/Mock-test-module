const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminProfileController = require('../controllers/adminProfileController');
const testController = require('../controllers/testController');
const { authenticateAdmin } = require('../middleware/adminAuth');

// All admin routes require authentication
router.use(authenticateAdmin);

router.post('/questions/generate', adminController.generateQuestionsWithAI);
router.get('/categories', adminController.getCategories);
router.get('/difficulties', adminController.getDifficulties);

// AI generation preview and approval
router.post('/ai/generate', adminController.generateAIQuestionsPreview);
router.post('/ai/generate-all-difficulties', adminController.generateAllDifficultyLevels);
router.post('/ai/approve', adminController.approveAIQuestions);

// AI Generation Jobs (Progress Tracking)
router.post('/ai/generate-job', adminController.startGenerationJob);
router.post('/ai/approve-job', adminController.startApprovalJob);
router.get('/ai/status/:jobId', adminController.getGenerationStatus);

// Admin: Get all tests (including private)
router.get('/tests', testController.getAllTestsForAdmin);

// Admin profile routes
router.get('/profile', adminProfileController.getAdminProfile);
router.put('/profile', adminProfileController.updateAdminProfile);

module.exports = router;

