// Set provides O(1) lookup vs O(n) for Array.includes()
const BLACKLIST = new Set([
    'malware.example.com',
    'phishing.example.com',
    'badsite.test',
    'danger.example.org',
    'evil.example.net',
    'bad-reputation.com',
    'virus.exe',
]);

const UNSAFE_THRESHOLD = 0.3;

const getHostname = (urlString) => {
    try {
        return new URL(urlString).hostname.toLowerCase();
    } catch {
        return null;
    }
};

const classifyUrl = (url) => {
    const hostname = getHostname(url);

    if (!hostname) {
        return { url, safe: false, reason: 'malformed' };
    }

    if (BLACKLIST.has(hostname)) {
        return { url, safe: false, reason: 'blacklisted' };
    }

    const isSafe = Math.random() > UNSAFE_THRESHOLD;
    return { url, safe: isSafe, reason: 'simulated_check' };
};

const validateUrls = (urls) => urls.map(classifyUrl);

module.exports = { validateUrls };
