const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { userCreateValidation, userUpdateValidation } = require('../middleware/validators');

// All routes below require Admin authentication
router.use(protect, adminOnly);

// ─── GET /api/users/stats ─────────────────────────────────────────────────────
// Admin Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalProviders,
      availableProviders,
      totalUsers,
      activeUsers,
      categoryBreakdown,
      recentProviders,
      recentUsers,
    ] = await Promise.all([
      ServiceProvider.countDocuments(),
      ServiceProvider.countDocuments({ availability: true }),
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      ServiceProvider.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      ServiceProvider.find().sort({ createdAt: -1 }).limit(5).select('name category area availability createdAt'),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role status createdAt'),
    ]);

    res.json({
      totalProviders,
      availableProviders,
      totalUsers,
      activeUsers,
      categoryBreakdown: categoryBreakdown.map((c) => ({ category: c._id, count: c.count })),
      recentProviders,
      recentUsers,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Server error fetching stats.' });
  }
});

// ─── GET /api/users ───────────────────────────────────────────────────────────
// List all users with optional search and role filter
router.get('/', async (req, res) => {
  try {
    const { search, role } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json({ count: users.length, users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users.' });
  }
});

// ─── POST /api/users ──────────────────────────────────────────────────────────
// Admin adds a new user or admin
router.post('/', userCreateValidation, async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password, phone, role });

    res.status(201).json({
      message: `User "${name}" created successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ message: 'Server error creating user.' });
  }
});

// ─── PUT /api/users/:id ───────────────────────────────────────────────────────
// Admin updates user details, role, or status
router.put('/:id', userUpdateValidation, async (req, res) => {
  try {
    const updates = { ...req.body };

    // Do not allow password to be updated through this route
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: 'User updated successfully.', user });
  } catch (error) {
    console.error('Admin update user error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found (invalid ID).' });
    }
    res.status(500).json({ message: 'Server error updating user.' });
  }
});

// ─── DELETE /api/users/:id ────────────────────────────────────────────────────
// Admin deletes a user; admin cannot delete their own account
router.delete('/:id', async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ message: `User "${user.name}" deleted successfully.` });
  } catch (error) {
    console.error('Admin delete user error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found (invalid ID).' });
    }
    res.status(500).json({ message: 'Server error deleting user.' });
  }
});

module.exports = router;
