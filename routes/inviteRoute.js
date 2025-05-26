// routes/inviteRoutes.js
const express = require('express');
const router = express.Router();
const Invite = require('../models/inviteModel');
const User = require('../models/userModel');
const Workspace = require('../models/workspaceModel');
const { protect } = require('../middleware/authMiddleware');

//respond to an invite
router.post('/respond',protect, async (req, res) => {
  const { inviteId, action } = req.body;
  const invite = await Invite.findById(inviteId);

  if (!invite || invite.toEmail !== req.user.email)
    return res.status(403).json({ message: 'Invalid invite or permission denied' });

  if (action === 'accept') {
    await Workspace.findByIdAndUpdate(invite.workspaceId, {
      $addToSet: { memberIds: req.user.id }
    });
    invite.status = 'accepted';
  } else {
    invite.status = 'rejected';
  }

  await invite.save();
  res.json({ message: `Invite ${action}ed` });
});


// Get all invites for the authenticated user
router.get('/me',protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  const invites = await Invite.find({
    toEmail: user.email,
    status: 'pending'
  }).populate('fromUserId workspaceId');

  res.json(invites);
});

// Send invite
router.post('/',protect, async (req, res) => {
  const { toEmail, workspaceId } = req.body;
  const fromUserId = req.user.id;

  const toUser = await User.findOne({ email: toEmail });
  if (!toUser) return res.status(404).json({ message: 'User not found' });

  const existingInvite = await Invite.findOne({
    toEmail,
    workspaceId,
    status: 'pending'
  });
  if (existingInvite) return res.status(400).json({ message: 'Invite already sent' });

  const invite = await Invite.create({
    fromUserId,
    toEmail,
    workspaceId
  });

  res.status(201).json(invite);
});

module.exports = router;
