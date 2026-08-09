const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let bucket;

/**
 * Returns the GridFSBucket instance, creating it lazily on first call.
 * Must be called after Mongoose has connected.
 */
const getGridFSBucket = () => {
  if (!bucket) {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('[GridFS] Mongoose connection not established yet');
    }
    bucket = new GridFSBucket(db, { bucketName: 'fs' });
  }
  return bucket;
};

module.exports = { getGridFSBucket };
