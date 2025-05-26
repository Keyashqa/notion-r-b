const Page = require('../models/pageModel');

// POST /api/pages
const createPage = async (req, res) => {
  try {
    const { title, workspaceId } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const page = await Page.create({
      title,
      workspaceId: workspaceId || null,
      ownerId: req.user._id
    });

    res.status(201).json(page);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/pages
const getPages = async (req, res) => {
  try {
    // Return pages owned by the current user
    const pages = await Page.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(pages);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/pages/:id
const getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id).populate('blocks');

    if (!page || page.ownerId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Page not found or access denied' });
    }

    res.status(200).json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/pages/:id
const updatePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page || page.ownerId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Page not found or access denied' });
    }

    const { title, workspaceId } = req.body;
    if (title !== undefined) page.title = title;
    if (workspaceId !== undefined) page.workspaceId = workspaceId;

    await page.save();
    res.status(200).json(page);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/pages/:id
const deletePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page || page.ownerId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Page not found or access denied' });
    }

    await page.deleteOne();
    res.status(200).json({ message: 'Page deleted successfully' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createPage,
  getPages,
  getPageById,
  updatePage,
  deletePage
};
