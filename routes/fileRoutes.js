const express = require('express');
const router = express.Router();
const { upload, uploadToGridFS, streamFromGridFS } = require('../middleware/upload');

// POST /api/files/upload — upload a single image to GridFS
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided' });
    }

    const fileId = await uploadToGridFS(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    res.status(201).json({
      success: true,
      data: { fileId, filename: req.file.originalname, mimetype: req.file.mimetype },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/files/:id — stream file from GridFS
router.get('/:id', async (req, res) => {
  try {
    await streamFromGridFS(req.params.id, res);
  } catch (err) {
    if (err.name === 'BSONError' || err.message.includes('ObjectId')) {
      return res.status(400).json({ success: false, message: 'Invalid file ID' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
