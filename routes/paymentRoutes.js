const express = require('express');
const router = express.Router();
const Payment = require('../models/paymentModel'); // Make sure path is correct
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/payments
// @desc    Create a new payment record
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const {
      userId,
      amount,
      order_id,
      payment_id,
      signature,
      currency,
      email,
      status
    } = req.body;

    // Check required fields (adjust as per your needs)
    if (!amount || !order_id || !payment_id || !signature) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Create new payment document
    const newPayment = new Payment({
      userId: userId || null,
      amount,
      order_id,
      payment_id,
      signature,
      currency: currency || 'INR',  // Default if not provided
      email: email || '',
      status: status || 'paid',
    });

    const savedPayment = await newPayment.save();

    res.status(201).json(savedPayment);
  } catch (error) {
    console.error('Error creating payment:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
