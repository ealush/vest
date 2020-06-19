const TAG_NEXT = 'next';
const TAG_DEV = 'dev';

const KEYWORD_PATCH = 'patch';
const KEYWORD_MINOR = 'minor';
const KEYWORD_FEAT = 'feat';
const KEYWORD_MAJOR = 'major';
const KEYWORD_BREAKING = 'breaking';

const KEYWORDS_MINOR = [KEYWORD_MINOR, KEYWORD_FEAT];
const KEYWORDS_MAJOR = [KEYWORD_MAJOR, KEYWORD_BREAKING];

const CHANGELOG_TITLES = {
  [KEYWORD_MAJOR]: 'Changed or removed',
  [KEYWORD_MINOR]: 'Added',
  [KEYWORD_PATCH]: 'Fixed and improved',
};

module.exports = {
  CHANGELOG_TITLES,
  KEYWORD_MAJOR,
  KEYWORD_MINOR,
  KEYWORD_PATCH,
  KEYWORDS_MAJOR,
  KEYWORDS_MINOR,
  TAG_DEV,
  TAG_NEXT,
};
