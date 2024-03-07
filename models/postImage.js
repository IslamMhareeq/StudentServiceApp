const mongoose = require('mongoose');

const postImageSchema = new mongoose.Schema({
    img: { type: Buffer },
    contentType: { type: String }
});

const PostImage = mongoose.model('PostImage', postImageSchema);

module.exports = PostImage;
