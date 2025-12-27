const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate } = require('../middleware/auth');

// Protect settings routes with authentication (and ideally admin check, but using auth for now)
router.get('/', authenticate, settingsController.getSettings);
router.put('/', authenticate, settingsController.updateSetting);

module.exports = router;
