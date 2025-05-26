const express = require('express');
const router = express.Router();
const {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/workspaces
router.post('/', protect, createWorkspace);

// @route   GET /api/workspaces
router.get('/', protect, getUserWorkspaces);

// @route   GET /api/workspaces/:id
router.get('/:id', protect, getWorkspaceById);

// @route   PUT /api/workspaces/:id
router.put('/:id', protect, updateWorkspace);

// @route   DELETE /api/workspaces/:id
router.delete('/:id', protect, deleteWorkspace);

module.exports = router;
