const Block = require('../models/blockModel');

// POST /api/blocks
const createBlock = async (req, res) => {
  try {
    const { pageId, type, content, metadata } = req.body;

    if (!pageId || !type) {
      return res.status(400).json({ message: 'pageId and type are required' });
    }

    const blockCount = await Block.countDocuments({ pageId });

    const block = await Block.create({
      pageId,
      type,
      content,
      metadata,
      position: blockCount
    });

    res.status(201).json(block);
  } catch (error) {
    console.error('Error creating block:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/blocks/page/:pageId
const getBlocksByPage = async (req, res) => {
  try {
    const blocks = await Block.find({ pageId: req.params.pageId }).sort('position');
    res.status(200).json(blocks);
  } catch (error) {
    console.error('Error getting blocks:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/blocks/:id
const updateBlock = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id);
    if (!block) return res.status(404).json({ message: 'Block not found' });

    const { content, type, metadata } = req.body;

    if (content !== undefined) block.content = content;
    if (type !== undefined) block.type = type;
    if (metadata !== undefined) block.metadata = metadata;

    await block.save();
    res.status(200).json(block);
  } catch (error) {
    console.error('Error updating block:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/blocks/:id
const deleteBlock = async (req, res) => {
  try {
    const block = await Block.findById(req.params.id);
    if (!block) return res.status(404).json({ message: 'Block not found' });

    const deletedPosition = block.position;
    const pageId = block.pageId;

    await block.deleteOne();

    // Reorder remaining blocks
    await Block.updateMany(
      { pageId, position: { $gt: deletedPosition } },
      { $inc: { position: -1 } }
    );

    res.status(200).json({ message: 'Block deleted successfully' });
  } catch (error) {
    console.error('Error deleting block:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/blocks/:id/move
const moveBlock = async (req, res) => {
  try {
    const { newPosition } = req.body;
    const block = await Block.findById(req.params.id);
    if (!block) return res.status(404).json({ message: 'Block not found' });

    const oldPosition = block.position;
    const pageId = block.pageId;

    if (newPosition === oldPosition) {
      return res.status(200).json(block);
    }

    if (newPosition > oldPosition) {
      await Block.updateMany(
        { pageId, position: { $gt: oldPosition, $lte: newPosition } },
        { $inc: { position: -1 } }
      );
    } else {
      await Block.updateMany(
        { pageId, position: { $gte: newPosition, $lt: oldPosition } },
        { $inc: { position: 1 } }
      );
    }

    block.position = newPosition;
    await block.save();

    res.status(200).json(block);
  } catch (error) {
    console.error('Error moving block:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBlock,
  getBlocksByPage,
  updateBlock,
  deleteBlock,
  moveBlock
};
