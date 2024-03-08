const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    content: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'postImage' }
}, { timestamps: true });

postSchema.index({ title: 'text', content: 'text' });

const Post = mongoose.model('Post', postSchema);

Post.createIndexes();

module.exports = Post;
