const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');

router.post('/login', adminAuthController.adminLogin);
router.post('/logout', adminAuthController.adminLogout);

module.exports = router;

