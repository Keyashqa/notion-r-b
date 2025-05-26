const mongoose = require('mongoose');

const pageSchema = new mongoose.Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace' }, // optional
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  blocks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Block' }],
}, { timestamps: true });

module.exports = mongoose.model('Page', pageSchema);
