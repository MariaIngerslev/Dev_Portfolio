const URL_PATTERN = /(https?:\/\/[^\s]+)/g;

const extractUrls = (text) => text.match(URL_PATTERN) || [];

module.exports = extractUrls;
