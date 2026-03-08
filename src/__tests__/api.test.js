const request = require('supertest');
const app = require('../app');

const mockSafeBrowsingResponse = (matchedUrls = []) => {
    const matches = matchedUrls.map((url) => ({ threat: { url } }));
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => (matches.length > 0 ? { matches } : {}),
    });
};

describe('POST /api/validate-urls', () => {
    beforeEach(() => {
        process.env.GOOGLE_SAFE_BROWSING_API_KEY = 'test-api-key';
        mockSafeBrowsingResponse([]); // default: all URLs are safe
    });

    afterEach(() => {
        delete process.env.GOOGLE_SAFE_BROWSING_API_KEY;
        jest.restoreAllMocks();
    });

    test('safe URL returns allSafe: true', async () => {
        const res = await request(app)
            .post('/api/validate-urls')
            .send({ urls: ['https://example.com'] });
        expect(res.status).toBe(200);
        expect(res.body.allSafe).toBe(true);
        expect(res.body.results[0].reason).toBe('safe');
    });

    test('URL flagged by Safe Browsing returns allSafe: false with reason threat_detected', async () => {
        mockSafeBrowsingResponse(['https://malware.example.com']);
        const res = await request(app)
            .post('/api/validate-urls')
            .send({ urls: ['https://malware.example.com'] });
        expect(res.status).toBe(200);
        expect(res.body.allSafe).toBe(false);
        expect(res.body.results[0].reason).toBe('threat_detected');
    });

    test('mixed safe and unsafe returns allSafe: false with both results', async () => {
        mockSafeBrowsingResponse(['https://malware.example.com']);
        const res = await request(app)
            .post('/api/validate-urls')
            .send({ urls: ['https://example.com', 'https://malware.example.com'] });
        expect(res.status).toBe(200);
        expect(res.body.allSafe).toBe(false);
        expect(res.body.results).toHaveLength(2);
        const reasons = res.body.results.map((r) => r.reason);
        expect(reasons).toContain('safe');
        expect(reasons).toContain('threat_detected');
    });

    test('empty array returns 400', async () => {
        const res = await request(app)
            .post('/api/validate-urls')
            .send({ urls: [] });
        expect(res.status).toBe(400);
    });

    test('urls not an array returns 400', async () => {
        const res = await request(app)
            .post('/api/validate-urls')
            .send({ urls: 'https://example.com' });
        expect(res.status).toBe(400);
    });

    test('array with numbers returns 400', async () => {
        const res = await request(app)
            .post('/api/validate-urls')
            .send({ urls: [1, 2, 3] });
        expect(res.status).toBe(400);
    });

    test('missing urls field returns 400', async () => {
        const res = await request(app)
            .post('/api/validate-urls')
            .send({});
        expect(res.status).toBe(400);
    });
});
