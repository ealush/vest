const { readdirSync } = require('fs');

const PACKAGES_DIR = 'packages';
const PACKAGE_NAMES = readdirSync(`./${PACKAGES_DIR}`);

const PACKAGE_NAME_VEST = 'vest';
const TAG_NEXT = 'next';

const KEYWORD_PATCH = 'patch';
const KEYWORD_MINOR = 'minor';
const KEYWORD_MAJOR = 'major';
const KEYWORD_DOCS = 'docs';
const KEYWORD_PERF = 'perf';
const KEYWORD_CONF = 'conf';
const KEYWORD_FIX = 'fix';
const KEYWORD_FEAT = 'feat';
const KEYWORD_BREAKING = 'breaking';

const KEYWORDS_PATCH = [
  KEYWORD_PATCH,
  KEYWORD_DOCS,
  KEYWORD_CONF,
  KEYWORD_FIX,
  KEYWORD_PERF,
];
const KEYWORDS_MINOR = [KEYWORD_MINOR, KEYWORD_FEAT];
const KEYWORDS_MAJOR = [KEYWORD_MAJOR, KEYWORD_BREAKING];

const CHANGELOG_TITLES = {
  [KEYWORD_MAJOR]: 'Changed or removed',
  [KEYWORD_MINOR]: 'Added',
  [KEYWORD_PATCH]: 'Fixed and improved',
};

module.exports = {
  KEYWORD_PATCH,
  KEYWORD_MINOR,
  KEYWORD_MAJOR,
  CHANGELOG_TITLES,
  PACKAGES_DIR,
  PACKAGE_NAMES,
  PACKAGE_NAME_VEST,
  KEYWORDS_PATCH,
  KEYWORDS_MINOR,
  KEYWORDS_MAJOR,
  KEYWORD_DOCS,
  KEYWORD_CONF,
  TAG_NEXT,
};
