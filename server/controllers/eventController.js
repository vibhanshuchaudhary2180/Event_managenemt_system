const { validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, date } = req.body;

  try {
    // Validate date is in the future
    const eventDate = new Date(date);
    if (eventDate <= new Date()) {
      return res.status(400).json({ message: 'Event date must be in the future' });
    }

    const event = await Event.create({
      title,
      description,
      date: eventDate,
      creator: req.user._id,
      attendees: [], // Empty array initially
    });

    res.status(201).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    // Get all events with date in the future
    const events = await Event.find({ date: { $gt: new Date() } })
      .populate('creator', 'name email')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Register a user for an event
// @route   POST /api/events/:eventId/register
// @access  Private
const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user._id;

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event date is in the past
    if (event.date <= new Date()) {
      return res.status(400).json({ message: 'Cannot register for past events' });
    }

    // Check if user is already registered
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: 'User already registered for this event' });
    }

    // Add user to event attendees
    event.attendees.push(userId);
    await event.save();

    // Add event to user's registered events
    const user = await User.findById(userId);
    user.registeredEvents.push(eventId);
    await user.save();

    res.json({ message: 'Successfully registered for event', event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get events registered by a user
// @route   GET /api/users/:userId/events
// @access  Private
const getUserEvents = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Verify user is accessing their own data or admin
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to access this resource' });
    }

    const user = await User.findById(userId).populate({
      path: 'registeredEvents',
      match: { date: { $gt: new Date() } }, // Only get future events
      select: 'title description date creator',
      populate: { path: 'creator', select: 'name email' },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.registeredEvents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel registration for an event
// @route   DELETE /api/events/:eventId/cancel/:userId
// @access  Private
const cancelEventRegistration = async (req, res) => {
  try {
    const { eventId, userId } = req.params;

    // Verify user is canceling their own registration
    if (req.user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this registration' });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user is registered for the event
    if (!event.attendees.includes(userId)) {
      return res.status(400).json({ message: 'User is not registered for this event' });
    }

    // Remove user from event attendees
    event.attendees = event.attendees.filter(
      attendee => attendee.toString() !== userId
    );
    await event.save();

    // Remove event from user's registered events
    const user = await User.findById(userId);
    user.registeredEvents = user.registeredEvents.filter(
      event => event.toString() !== eventId
    );
    await user.save();

    res.json({ message: 'Event registration cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createEvent,
  getEvents,
  registerForEvent,
  getUserEvents,
  cancelEventRegistration,
};