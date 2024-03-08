const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const privateMessageSchema = new Schema({
    content: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema);

module.exports = PrivateMessage;
