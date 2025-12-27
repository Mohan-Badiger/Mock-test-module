const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.get('/', testController.getAllTests);
router.get('/difficulties', testController.getDifficulties); // Public endpoint for difficulties
router.get('/category/:categoryId', testController.getTestsByCategory);
router.get('/:id', testController.getTestById);
router.post('/', testController.createTest);
router.put('/:id', testController.updateTest);
router.delete('/:id', testController.deleteTest);

module.exports = router;

