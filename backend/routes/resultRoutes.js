const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const { authenticate } = require('../middleware/auth');

router.post('/start', authenticate, resultController.startTestAttempt);
router.post('/finish', resultController.finishTestAttempt);
router.get('/attempt/:id', resultController.getAttemptDetails);
router.get('/summary/:attemptId', resultController.getTestSummary);
router.get('/history/:userId', resultController.getTestHistory);
router.post('/analysis', resultController.generatePerformanceAnalysis);

module.exports = router;

