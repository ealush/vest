const {
  KEYWORD_MAJOR,
  KEYWORD_MINOR,
  KEYWORD_PATCH,
  KEYWORDS_MAJOR,
  KEYWORDS_MINOR,
} = require('../constants');

const REGEXP_MAJOR = new RegExp(`${KEYWORDS_MAJOR.join('|')}:`, 'i');
const REGEXP_MINOR = new RegExp(`${KEYWORDS_MINOR.join('|')}:`, 'i');

/**
 * Determines semver level
 * @param {String} message
 * @return {String} change level
 */
const determineChangeLevel = message => {
  if (message.match(REGEXP_MAJOR)) {
    return KEYWORD_MAJOR;
  }

  if (message.match(REGEXP_MINOR)) {
    return KEYWORD_MINOR;
  }

  return KEYWORD_PATCH;
};

module.exports = determineChangeLevel;
