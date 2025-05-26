const multer = require('multer');
const storage = multer.memoryStorage(); // Store in memory for Cloudinary
const upload = multer({ storage });

module.exports = upload;
