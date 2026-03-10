const Post = require('../models/Post');

describe('Post slug field', () => {
    it('saves a post with a slug', async () => {
        const post = await Post.create({ title: 'Test', content: 'Body', slug: 'test-slug' });
        expect(post.slug).toBe('test-slug');
    });

    it('rejects a duplicate slug', async () => {
        await Post.create({ title: 'A', content: 'Body', slug: 'dupe' });
        await expect(
            Post.create({ title: 'B', content: 'Body', slug: 'dupe' })
        ).rejects.toThrow();
    });

    it('allows multiple posts without a slug (sparse index)', async () => {
        await Post.create({ title: 'A', content: 'Body' });
        await Post.create({ title: 'B', content: 'Body' });
        const count = await Post.countDocuments();
        expect(count).toBe(2);
    });
});
