const express = require('express');
const router = express.Router();
const User = require('../models/userModel'); // Import your User model
const moment = require('moment');
const { protect } = require('../middleware/authMiddleware');

router.get('/overview', protect, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const today = moment().startOf('day').toDate();
    const activeToday = await User.countDocuments({
      updatedAt: { $gte: today },
    });

    const yesterday = moment().subtract(1, 'days').startOf('day').toDate();
    const newSignups = await User.countDocuments({
      createdAt: { $gte: yesterday },
    });

    res.json({
      totalUsers,
      activeToday,
      newSignups,
    });
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/userstats/graphdata', protect, async (req, res) => {
  try {
    const days = 14; // last 14 days
    const today = moment().startOf('day');

    // Prepare array of dates strings
    let dates = [];
    for (let i = days - 1; i >= 0; i--) {
      dates.push(today.clone().subtract(i, 'days').format('YYYY-MM-DD'));
    }

    // Aggregate new signups per day
    const signupsAgg = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: today.clone().subtract(days, 'days').toDate() },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Aggregate active users per day (based on updatedAt)
    const activeAgg = await User.aggregate([
      {
        $match: {
          updatedAt: { $gte: today.clone().subtract(days, 'days').toDate() },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Map aggregations to date map
    const signupsMap = {};
    signupsAgg.forEach((item) => {
      signupsMap[item._id] = item.count;
    });

    const activeMap = {};
    activeAgg.forEach((item) => {
      activeMap[item._id] = item.count;
    });

    // Build arrays with counts aligned with dates (fill 0 if missing)
    const signupsPerDay = dates.map((date) => ({
      date,
      count: signupsMap[date] || 0,
    }));

    const activePerDay = dates.map((date) => ({
      date,
      count: activeMap[date] || 0,
    }));

    res.json({
      signupsPerDay,
      activePerDay,
    });
  } catch (error) {
    console.error('Error fetching user stats graph data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/users', protect, async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();
    const users = await User.find({})
      .select('-password') // exclude password field
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const pages = Math.ceil(totalUsers / limit);

    res.json({ users, totalUsers, page, pages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update user by ID
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', protect, async (req, res) => {
  try {
    const { username, email, role } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete user by ID
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
