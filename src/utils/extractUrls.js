// Stops at whitespace, quotes, and angle brackets; trailing terminal punctuation
// is excluded via the final character class, exploiting regex backtracking.
const URL_PATTERN = /(https?:\/\/[^\s"'<>]*[^\s"'<>.,);!?])/g;

const extractUrls = (text) => {
    if (typeof text !== 'string') return [];
    return text.match(URL_PATTERN) || [];
};

module.exports = extractUrls;
