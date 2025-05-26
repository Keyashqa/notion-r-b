const Workspace = require('../models/workspaceModel');
const Page = require('../models/pageModel'); // Required for joining with pages

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Workspace name is required' });
    }

    const newWorkspace = await Workspace.create({
      name,
      ownerId: req.user._id,
      memberIds: [req.user._id],
    });

    res.status(201).json(newWorkspace);
  } catch (error) {
    console.error('Error creating workspace:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all workspaces for logged-in user
// @route   GET /api/workspaces
// @access  Private
const getUserWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      memberIds: req.user._id,
    });

    res.status(200).json(workspaces);
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a workspace and its pages
// @route   GET /api/workspaces/:id
// @access  Private
const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const isOwner = workspace.ownerId.toString() === req.user._id.toString();
    const isMember = workspace.memberIds.some(id => id.toString() === req.user._id.toString());

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const pages = await Page.find({ workspaceId: workspace._id });

    res.status(200).json({ workspace, pages });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update workspace name
// @route   PUT /api/workspaces/:id
// @access  Private
const updateWorkspace = async (req, res) => {
  try {
    const { name } = req.body;

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (workspace.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update' });
    }

    workspace.name = name || workspace.name;
    await workspace.save();

    res.status(200).json(workspace);
  } catch (error) {
    console.error('Error updating workspace:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a workspace
// @route   DELETE /api/workspaces/:id
// @access  Private
const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    if (workspace.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete' });
    }

    // Optionally, delete related pages too:
    await Page.deleteMany({ workspaceId: workspace._id });

    await workspace.deleteOne();

    res.status(200).json({ message: 'Workspace and related pages deleted' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Export all handlers
module.exports = {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
};
