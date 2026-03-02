/**
 * One-time publish script: inserts a new blog post into MongoDB.
 * Idempotent — safe to run multiple times; skips if the post already exists.
 *
 * Usage: node scripts/publish-post.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../src/models/Post');
const RALPH_LOOP_POST = require('../src/data/ralph-loop-post');

async function publish() {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoUri) {
        console.error('Error: MONGODB_URI environment variable is not set.');
        process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    const existing = await Post.findOne({ title: RALPH_LOOP_POST.title });
    if (existing) {
        console.log(`Post already exists (id: ${existing._id}). Nothing to do.`);
        await mongoose.disconnect();
        return;
    }

    const post = await Post.create(RALPH_LOOP_POST);
    console.log(`Post published successfully (id: ${post._id}).`);
    console.log(`Accessible at: /posts/${post._id}`);

    await mongoose.disconnect();
}

publish().catch(err => {
    console.error('Failed to publish post:', err.message);
    process.exit(1);
});
