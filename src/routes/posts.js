const express = require('express');
const Post = require('../models/Post');
const validateObjectId = require('../middleware/validateObjectId');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts.' });
    }
});

// Defined before /:id to avoid being caught by the param route
router.get('/latest', async (req, res) => {
    try {
        const post = await Post.findOne().sort({ createdAt: -1 });
        if (!post) {
            return res.status(404).json({ error: 'No posts found.' });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch latest post.' });
    }
});

router.get('/:id', validateObjectId('id'), async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found.' });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch post.' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                error: "Both 'title' and 'content' are required."
            });
        }

        const post = await Post.create({ title, content });
        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create post.' });
    }
});

module.exports = router;
