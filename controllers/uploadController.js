const cloudinary = require('../utils/cloudinary');
const streamifier = require('streamifier');


const uploadImage = async (req, res) => {
  try {
    const fileBuffer = req.file?.buffer;
    if (!fileBuffer) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: 'image' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({ message: 'Upload failed' });
        }
        return res.status(200).json({ url: result.secure_url });
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  } catch (err) {
    console.error('Upload controller error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { uploadImage };
