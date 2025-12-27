const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.get('/test/:testId', questionController.getQuestionsByTest);
router.get('/test/:testId/difficulty/:difficultyId', questionController.getQuestionsByTestAndDifficulty);
router.get('/:id', questionController.getQuestionById);
router.post('/', questionController.createQuestion);
router.put('/:id', questionController.updateQuestion);
router.delete('/:id', questionController.deleteQuestion);

module.exports = router;

