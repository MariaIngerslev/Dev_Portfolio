// Set provides O(1) lookup vs O(n) for Array.includes()
const BLACKLIST = new Set([
    'malware.example.com',
    'phishing.example.com',
    'badsite.test',
    'danger.example.org',
    'evil.example.net',
    'bad-reputation.com',
    'virus.exe',
    'www.google.com',
]);

const MALICIOUS_KEYWORDS = ['unsafe', 'risky'];

const parseUrl = (urlString) => {
    try {
        return new URL(urlString);
    } catch {
        return null;
    }
};

const isBlacklisted = (urlString, parsedUrl) => {
    const lowercasedUrl = urlString.toLowerCase();
    for (const term of BLACKLIST) {
        if (lowercasedUrl.includes(term)) {
            return true;
        }
    }
    const hostname = parsedUrl.hostname.toLowerCase();
    return BLACKLIST.has(hostname);
};

const containsMaliciousKeyword = (urlString) => {
    const lowercasedUrl = urlString.toLowerCase();
    return MALICIOUS_KEYWORDS.some((keyword) => lowercasedUrl.includes(keyword));
};

const classifyUrl = (url) => {
    const parsedUrl = parseUrl(url);

    if (!parsedUrl) {
        return { url, safe: false, reason: 'malformed' };
    }

    if (isBlacklisted(url, parsedUrl)) {
        return { url, safe: false, reason: 'blacklisted' };
    }

    if (containsMaliciousKeyword(url)) {
        return { url, safe: false, reason: 'malicious' };
    }

    return { url, safe: true, reason: 'safe' };
};

const validateUrls = (urls) => {
    if (!Array.isArray(urls)) return [];
    return urls.map(classifyUrl);
};

module.exports = { validateUrls };
