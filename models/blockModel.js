const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', required: true },
  type: { type: String, required: true }, // e.g., paragraph, heading, image, code, list
  content: { type: String },
  metadata: {
    language: { type: String },   // for code blocks
    url: { type: String },        // for images
    altText: { type: String },    // optional: for images
    caption: { type: String }     // optional: for images
  },
  position: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Block', blockSchema);
