/** @type {string} */
const KEYWORD_PATCH = 'patch';
/** @type {string} */
const KEYWORD_MINOR = 'minor';
/** @type {string} */
const KEYWORD_FEAT = 'feat';
/** @type {string} */
const KEYWORD_ADDED = 'added';
/** @type {string} */
const KEYWORD_ADD = 'add';
/** @type {string} */
const KEYWORD_MAJOR = 'major';
/** @type {string} */
const KEYWORD_BREAKING = 'breaking';

// Tag constants for release branches
/** @type {string} */
const TAG_NEXT = 'next';
/** @type {string} */
const TAG_DEV = 'dev';

/** @type {string[]} */
const KEYWORDS_MINOR = [
  KEYWORD_MINOR,
  KEYWORD_FEAT,
  KEYWORD_ADDED,
  KEYWORD_ADD,
];
/** @type {string[]} */
const KEYWORDS_MAJOR = [KEYWORD_MAJOR, KEYWORD_BREAKING];

/** @type {Record<string, string>} */
const CHANGELOG_TITLES = {
  [KEYWORD_MAJOR]: 'Changed or removed',
  [KEYWORD_MINOR]: 'Added',
  [KEYWORD_PATCH]: 'Fixed and improved',
};

export {
  CHANGELOG_TITLES,
  KEYWORD_MAJOR,
  KEYWORD_MINOR,
  KEYWORD_PATCH,
  KEYWORDS_MAJOR,
  KEYWORDS_MINOR,
  TAG_NEXT,
  TAG_DEV,
};
