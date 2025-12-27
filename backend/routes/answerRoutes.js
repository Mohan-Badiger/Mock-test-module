const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');

router.post('/submit', answerController.submitAnswer);
router.get('/attempt/:attemptId', answerController.getAnswersByAttempt);

module.exports = router;

