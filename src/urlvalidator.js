const SAFE_BROWSING_API_URL = 'https://safebrowsing.googleapis.com/v4/threatMatches:find';

const parseUrl = (urlString) => {
    try {
        return new URL(urlString);
    } catch {
        return null;
    }
};

/**
 * Sends a batch of URL strings to the Google Safe Browsing API and returns a
 * Set of URLs that were flagged as threats. Returns an empty Set when the API
 * key is absent, the input is empty, or a non-OK response is received (the
 * caller is responsible for catching network errors).
 */
const checkWithSafeBrowsing = async (urls) => {
    if (urls.length === 0) return new Set();

    const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
    if (!apiKey) {
        console.warn('[urlvalidator] GOOGLE_SAFE_BROWSING_API_KEY is not set — skipping Safe Browsing check, all URLs treated as safe.');
        return new Set();
    }

    const response = await fetch(`${SAFE_BROWSING_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            client: { clientId: 'url-validator-blog', clientVersion: '1.0.0' },
            threatInfo: {
                threatTypes: [
                    'MALWARE',
                    'SOCIAL_ENGINEERING',
                    'UNWANTED_SOFTWARE',
                    'POTENTIALLY_HARMFUL_APPLICATION',
                ],
                platformTypes: ['ANY_PLATFORM'],
                threatEntryTypes: ['URL'],
                threatEntries: urls.map((url) => ({ url })),
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Safe Browsing API returned HTTP ${response.status}`);
    }

    const data = await response.json();
    return new Set((data.matches || []).map((match) => match.threat.url));
};

const classifyUrl = (url, unsafeUrlSet) => {
    if (!parseUrl(url)) {
        return { url, safe: false, reason: 'malformed' };
    }

    if (unsafeUrlSet.has(url)) {
        return { url, safe: false, reason: 'threat_detected' };
    }

    return { url, safe: true, reason: 'safe' };
};

const validateUrls = async (urls) => {
    if (!Array.isArray(urls)) return [];

    const stringUrls = urls.filter((url) => typeof url === 'string');

    let unsafeUrlSet = new Set();
    try {
        unsafeUrlSet = await checkWithSafeBrowsing(stringUrls);
    } catch (err) {
        console.error('[urlvalidator] Safe Browsing API call failed — treating all URLs as safe:', err.message);
    }

    return urls.map((url) => {
        if (typeof url !== 'string') {
            return { url, safe: false, reason: 'malformed' };
        }
        return classifyUrl(url, unsafeUrlSet);
    });
};

module.exports = { validateUrls };
