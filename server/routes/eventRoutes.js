const express = require('express');
const { check } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const {
  createEvent,
  getEvents,
  registerForEvent,
  cancelEventRegistration,
} = require('../controllers/eventController');

const router = express.Router();

// @route   POST /api/events
// @desc    Create a new event
// @access  Private
router.post(
  '/',
  [
    protect,
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('date', 'Date is required').not().isEmpty(),
  ],
  createEvent
);

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', getEvents);

// @route   POST /api/events/:eventId/register
// @desc    Register for an event
// @access  Private
router.post('/:eventId/register', protect, registerForEvent);

// @route   DELETE /api/events/:eventId/cancel/:userId
// @desc    Cancel event registration
// @access  Private
router.delete('/:eventId/cancel/:userId', protect, cancelEventRegistration);

module.exports = router;