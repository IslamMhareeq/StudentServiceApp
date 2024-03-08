const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
    date: { type: String, required: true }, // Assuming date as 'YYYY-MM-DD'
    content: { type: String, required: true } // Note content
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
