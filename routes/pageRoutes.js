const express = require('express');
const router = express.Router();
const {
  createPage,
  getPages,
  getPageById,
  updatePage,
  deletePage
} = require('../controllers/pageController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createPage);
router.get('/', protect, getPages);
router.get('/:id', protect, getPageById);
router.put('/:id', protect, updatePage);
router.delete('/:id', protect, deletePage);

module.exports = router;
