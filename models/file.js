const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, // Reference to the User
  filename: String,
  contentType: String,
  fileData: Buffer, 
  uploadedAt: { type: Date, default: Date.now }
});

const File = mongoose.model('File', fileSchema);

module.exports = File;
