const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const crypto = require('crypto');
const sendEmail = require('../utils/forgetEmail');
const bcrypt = require('bcryptjs');


// Forgot Password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const token = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  user.resetPasswordToken = hashed;
  user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  const resetLink = `${process.env.CORS_URL}/reset-password/${token}`;
  await sendEmail(email, 'Reset your password', `Click this link: ${resetLink}`);

  res.json({ message: 'Reset link sent to your email.' });
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  user.passwordHash = hashedPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me',protect, getCurrentUser);
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Create JWT token on successful login
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    // Redirect to frontend with token
    res.redirect(`${process.env.CORS_URL}/oauth-success?token=${token}`);
  }
);


router.get('/', (req, res) => {
  res.send('Auth route is working!');
});

module.exports = router;
