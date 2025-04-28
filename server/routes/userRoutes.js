const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getUserEvents } = require('../controllers/eventController');

const router = express.Router();

// @route   GET /api/users/:userId/events
// @desc    Get events registered by a user
// @access  Private
router.get('/:userId/events', protect, getUserEvents);

module.exports = router;