const { validateUrls } = require('./urlvalidator');

describe('validateUrls', () => {
    describe('blacklisted URLs', () => {
        test('malware.example.com is blocked', () => {
            const [result] = validateUrls(['https://malware.example.com/path']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('blacklisted');
        });

        test('phishing.example.com is blocked', () => {
            const [result] = validateUrls(['https://phishing.example.com']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('blacklisted');
        });

        test('bad-reputation.com is blocked', () => {
            const [result] = validateUrls(['http://bad-reputation.com/page']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('blacklisted');
        });

        test('virus.exe is blocked as hostname', () => {
            const [result] = validateUrls(['http://virus.exe/malware']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('blacklisted');
        });

        test('virus.exe is blocked in URL path', () => {
            const [result] = validateUrls(['https://example.com/downloads/virus.exe']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('blacklisted');
        });

        test('www.google.com is blocked', () => {
            const [result] = validateUrls(['https://www.google.com/search']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('blacklisted');
        });

        test('blacklist check is case-insensitive', () => {
            const [result] = validateUrls(['http://VIRUS.EXE/payload']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('blacklisted');
        });

        test('blacklist matches terms anywhere in the URL', () => {
            const [result] = validateUrls(['https://safe.com/malware.example.com']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('blacklisted');
        });
    });

    describe('keyword-based detection', () => {
        test('URL containing "unsafe" is flagged as malicious', () => {
            const [result] = validateUrls(['https://example.com/unsafe-page']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('malicious');
        });

        test('URL containing "risky" is flagged as malicious', () => {
            const [result] = validateUrls(['https://example.com/risky-download']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('malicious');
        });

        test('keyword detection is case-insensitive', () => {
            const [result] = validateUrls(['https://example.com/UNSAFE']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('malicious');
        });
    });

    describe('safe URLs', () => {
        test('non-blacklisted URL without keywords is safe', () => {
            const [result] = validateUrls(['https://safe-site.com']);
            expect(result.safe).toBe(true);
            expect(result.reason).toBe('safe');
        });

        test('another clean URL is safe', () => {
            const [result] = validateUrls(['https://example.org/page']);
            expect(result.safe).toBe(true);
            expect(result.reason).toBe('safe');
        });
    });

    describe('malformed URLs', () => {
        test('returns malformed for a string without protocol', () => {
            const [result] = validateUrls(['not-a-valid-url']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('malformed');
        });

        test('returns malformed for an empty string', () => {
            const [result] = validateUrls(['']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('malformed');
        });

        test('returns malformed for garbage input', () => {
            const [result] = validateUrls(['://missing-scheme']);
            expect(result.safe).toBe(false);
            expect(result.reason).toBe('malformed');
        });
    });

    describe('multiple URLs', () => {
        test('validates multiple URLs in a single call', () => {
            const results = validateUrls([
                'https://safe-site.com',
                'https://malware.example.com',
                'not-a-url',
            ]);

            expect(results).toHaveLength(3);
            expect(results[0]).toEqual({ url: 'https://safe-site.com', safe: true, reason: 'safe' });
            expect(results[1]).toEqual({ url: 'https://malware.example.com', safe: false, reason: 'blacklisted' });
            expect(results[2]).toEqual({ url: 'not-a-url', safe: false, reason: 'malformed' });
        });

        test('returns empty array for empty input', () => {
            const results = validateUrls([]);
            expect(results).toEqual([]);
        });
    });

    describe('type safety', () => {
        test('returns empty array for null input', () => {
            expect(validateUrls(null)).toEqual([]);
        });

        test('returns empty array for undefined input', () => {
            expect(validateUrls(undefined)).toEqual([]);
        });

        test('handles non-string values in the array without throwing', () => {
            expect(() => validateUrls(['https://safe.com', null])).not.toThrow();
            const results = validateUrls(['https://safe.com', null]);
            expect(results).toHaveLength(2);
            expect(results[0]).toMatchObject({ safe: true, reason: 'safe' });
            expect(results[1]).toMatchObject({ safe: false, reason: 'malformed' });
        });
    });

    describe('internationalized domain names', () => {
        test('does not throw on IDN URLs and returns results with correct structure', () => {
            const idnUrls = ['http://københavn.dk', 'https://æøå.com'];
            expect(() => validateUrls(idnUrls)).not.toThrow();
            const results = validateUrls(idnUrls);
            expect(results).toHaveLength(2);
            results.forEach((result) => {
                expect(result).toHaveProperty('url');
                expect(result).toHaveProperty('safe');
                expect(result).toHaveProperty('reason');
            });
        });
    });

    describe('result structure', () => {
        test('each result contains url, safe, and reason fields', () => {
            const [result] = validateUrls(['https://example.com']);
            expect(result).toHaveProperty('url', 'https://example.com');
            expect(result).toHaveProperty('safe', true);
            expect(result).toHaveProperty('reason', 'safe');
        });

        test('preserves the original URL string in the result', () => {
            const originalUrl = 'https://MALWARE.EXAMPLE.COM/Some/Path?q=1';
            const [result] = validateUrls([originalUrl]);
            expect(result.url).toBe(originalUrl);
        });
    });
});
