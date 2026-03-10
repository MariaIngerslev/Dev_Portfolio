const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title:     { type: String, required: true },
    content:   { type: String, required: true },
    heroImage: { type: String },
    slug:      { type: String, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
