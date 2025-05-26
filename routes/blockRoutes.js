const express = require('express');
const router = express.Router();
const {
  createBlock,
  getBlocksByPage,
  updateBlock,
  deleteBlock,
  moveBlock
} = require('../controllers/blockController');
const {protect} = require('../middleware/authMiddleware');

router.post('/', protect, createBlock);
router.get('/page/:pageId', protect, getBlocksByPage);
router.put('/:id', protect, updateBlock);
router.delete('/:id', protect, deleteBlock);
router.patch('/:id/move', protect, moveBlock);

module.exports = router;
