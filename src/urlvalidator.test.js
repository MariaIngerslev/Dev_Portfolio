const { validateUrls } = require('./urlvalidator');

const mockSafeBrowsingResponse = (matchedUrls = []) => {
    const matches = matchedUrls.map((url) => ({ threat: { url } }));
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => (matches.length > 0 ? { matches } : {}),
    });
};

describe('validateUrls', () => {
    beforeEach(() => {
        process.env.GOOGLE_SAFE_BROWSING_API_KEY = 'test-api-key';
    });

    afterEach(() => {
        delete process.env.GOOGLE_SAFE_BROWSING_API_KEY;
        jest.restoreAllMocks();
    });

    describe('safe URLs', () => {
        test('URL not in API response is marked safe', async () => {
            mockSafeBrowsingResponse([]);
            const [result] = await validateUrls(['https://safe-site.com']);
            expect(result).toEqual({ url: 'https://safe-site.com', safe: true, reason: 'safe' });
        });

        test('another clean URL is safe', async () => {
            mockSafeBrowsingResponse([]);
            const [result] = await validateUrls(['https://example.org/page']);
            expect(result.safe).toBe(true);
            expect(result.reason).toBe('safe');
        });
    });

    describe('threat detection', () => {
        test('URL matched by API is flagged as threat_detected', async () => {
            mockSafeBrowsingResponse(['https://evil.com']);
            const [result] = await validateUrls(['https://evil.com']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('threat_detected');
        });

        test('only the matched URL is flagged; others remain safe', async () => {
            mockSafeBrowsingResponse(['https://evil.com']);
            const results = await validateUrls(['https://safe.com', 'https://evil.com']);
            expect(results[0]).toEqual({ url: 'https://safe.com', safe: true, reason: 'safe' });
            expect(results[1]).toEqual({ url: 'https://evil.com', safe: false, reason: 'threat_detected' });
        });

        test('preserves the original URL string in the result', async () => {
            const originalUrl = 'https://example.com/Some/Path?q=1';
            mockSafeBrowsingResponse([]);
            const [result] = await validateUrls([originalUrl]);
            expect(result.url).toBe(originalUrl);
        });
    });

    describe('malformed URLs', () => {
        test('string without protocol is malformed (no API call made for it)', async () => {
            mockSafeBrowsingResponse([]);
            const [result] = await validateUrls(['not-a-valid-url']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('malformed');
        });

        test('empty string is malformed', async () => {
            mockSafeBrowsingResponse([]);
            const [result] = await validateUrls(['']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('malformed');
        });

        test('string with missing scheme is malformed', async () => {
            mockSafeBrowsingResponse([]);
            const [result] = await validateUrls(['://missing-scheme']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('malformed');
        });
    });

    describe('API not configured', () => {
        test('when API key is missing, all valid URLs are treated as safe', async () => {
            delete process.env.GOOGLE_SAFE_BROWSING_API_KEY;
            global.fetch = jest.fn();
            const results = await validateUrls(['https://example.com', 'https://another.com']);
            expect(results.every((r) => r.safe)).toBe(true);
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });

    describe('API failure fallback', () => {
        test('treats all valid URLs as safe when API returns a non-OK status', async () => {
            global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 });
            const results = await validateUrls(['https://example.com']);
            expect(results[0]).toEqual({ url: 'https://example.com', safe: true, reason: 'safe' });
        });

        test('treats all valid URLs as safe when the network call throws', async () => {
            global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
            const results = await validateUrls(['https://example.com']);
            expect(results[0]).toEqual({ url: 'https://example.com', safe: true, reason: 'safe' });
        });
    });

    describe('API request shape', () => {
        test('sends all string URLs to the API in a single batch call', async () => {
            mockSafeBrowsingResponse([]);
            await validateUrls(['https://a.com', 'https://b.com']);
            expect(global.fetch).toHaveBeenCalledTimes(1);
            const [url, options] = global.fetch.mock.calls[0];
            expect(url).toContain('test-api-key');
            const body = JSON.parse(options.body);
            expect(body.threatInfo.threatEntries).toEqual([
                { url: 'https://a.com' },
                { url: 'https://b.com' },
            ]);
        });

        test('does not call the API when the input array is empty', async () => {
            global.fetch = jest.fn();
            await validateUrls([]);
            expect(global.fetch).not.toHaveBeenCalled();
        });

        test('does not send non-string items to the API', async () => {
            mockSafeBrowsingResponse([]);
            await validateUrls(['https://safe.com', null]);
            const body = JSON.parse(global.fetch.mock.calls[0][1].body);
            expect(body.threatInfo.threatEntries).toEqual([{ url: 'https://safe.com' }]);
        });
    });

    describe('multiple URLs', () => {
        test('validates multiple URLs in a single call', async () => {
            mockSafeBrowsingResponse(['https://malware.example.com']);
            const results = await validateUrls([
                'https://safe-site.com',
                'https://malware.example.com',
                'not-a-url',
            ]);
            expect(results).toHaveLength(3);
            expect(results[0]).toEqual({ url: 'https://safe-site.com', safe: true, reason: 'safe' });
            expect(results[1]).toEqual({ url: 'https://malware.example.com', safe: false, reason: 'threat_detected' });
            expect(results[2]).toEqual({ url: 'not-a-url', safe: false, reason: 'malformed' });
        });

        test('returns empty array for empty input', async () => {
            global.fetch = jest.fn();
            const results = await validateUrls([]);
            expect(results).toEqual([]);
        });
    });

    describe('type safety', () => {
        test('returns empty array for null input', async () => {
            expect(await validateUrls(null)).toEqual([]);
        });

        test('returns empty array for undefined input', async () => {
            expect(await validateUrls(undefined)).toEqual([]);
        });

        test('handles non-string values in the array without throwing', async () => {
            mockSafeBrowsingResponse([]);
            await expect(validateUrls(['https://safe.com', null])).resolves.not.toThrow();
            const results = await validateUrls(['https://safe.com', null]);
            expect(results).toHaveLength(2);
            expect(results[0]).toMatchObject({ safe: true, reason: 'safe' });
            expect(results[1]).toMatchObject({ safe: false, reason: 'malformed' });
        });
    });

    describe('internationalized domain names', () => {
        test('does not throw on IDN URLs and returns results with correct structure', async () => {
            mockSafeBrowsingResponse([]);
            const idnUrls = ['http://københavn.dk', 'https://æøå.com'];
            await expect(validateUrls(idnUrls)).resolves.not.toThrow();
            const results = await validateUrls(idnUrls);
            expect(results).toHaveLength(2);
            results.forEach((result) => {
                expect(result).toHaveProperty('url');
                expect(result).toHaveProperty('safe');
                expect(result).toHaveProperty('reason');
            });
        });
    });

    describe('result structure', () => {
        test('each result contains url, safe, and reason fields', async () => {
            mockSafeBrowsingResponse([]);
            const [result] = await validateUrls(['https://example.com']);
            expect(result).toHaveProperty('url', 'https://example.com');
            expect(result).toHaveProperty('safe', true);
            expect(result).toHaveProperty('reason', 'safe');
        });
    });
});
