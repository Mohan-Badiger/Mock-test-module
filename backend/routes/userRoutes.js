const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/:id', userController.getUser);
router.get('/:id/profile', userController.getUserProfile);
router.put('/:id/profile', userController.updateUserProfile);

module.exports = router;

