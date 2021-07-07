const {
  KEYWORD_MAJOR,
  KEYWORD_MINOR,
  KEYWORD_PATCH,
  KEYWORDS_MAJOR,
  KEYWORDS_MINOR,
} = require('./releaseKeywords');

const REGEXP_MAJOR = new RegExp(`(${KEYWORDS_MAJOR.join('|')})((.+))?:`, 'i');
const REGEXP_MINOR = new RegExp(`(${KEYWORDS_MINOR.join('|')})((.+))?:`, 'i');

/**
 * Determines semver level
 * @param {string[]} messages
 * @return {string} change level
 */
const determineChangeLevel = (...messages) => {
  return messages.reduce((keyword, message) => {
    if (keyword === KEYWORD_MAJOR) {
      return keyword;
    }

    if (message.match(REGEXP_MAJOR)) {
      return KEYWORD_MAJOR;
    }

    if (keyword === KEYWORD_MINOR) {
      return keyword;
    }

    if (message.match(REGEXP_MINOR)) {
      return KEYWORD_MINOR;
    }

    return keyword;
  }, KEYWORD_PATCH);
};

module.exports = determineChangeLevel;
