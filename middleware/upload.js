const multer = require('multer');
const { ObjectId } = require('mongodb');
const { Readable } = require('stream');
const { getGridFSBucket } = require('../config/gridfs');

// -- Multer config: memory storage, image-only, 5 MB limit --
const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}. Only images allowed.`));
    }
  },
});

// -- GridFS helpers --

/**
 * Upload a buffer to GridFS.
 * @returns {Promise<ObjectId>} The stored file's _id.
 */
const uploadToGridFS = (buffer, filename, mimetype) => {
  return new Promise((resolve, reject) => {
    const bucket = getGridFSBucket();
    const readStream = new Readable();
    readStream.push(buffer);
    readStream.push(null);

    const uploadStream = bucket.openUploadStream(filename, {
      contentType: mimetype,
    });

    readStream
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => resolve(uploadStream.id));
  });
};

/**
 * Stream a file from GridFS directly to an HTTP response.
 * Sets Content-Type from stored metadata.
 */
const streamFromGridFS = async (fileId, res) => {
  const bucket = getGridFSBucket();
  const id = new ObjectId(fileId);

  // Look up file metadata for content-type
  const files = await bucket.find({ _id: id }).toArray();
  if (!files.length) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }

  const file = files[0];
  res.set('Content-Type', file.contentType || 'application/octet-stream');
  res.set('Cache-Control', 'public, max-age=86400');

  bucket.openDownloadStream(id).pipe(res);
};

module.exports = { upload, uploadToGridFS, streamFromGridFS };
