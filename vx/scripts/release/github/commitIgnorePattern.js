const IGNORE_KEYWORDS = ['docs', 'conf', 'ci', 'build'];
const IGNORE_PATTERN = new RegExp(
  `${IGNORE_KEYWORDS.join('|')}:|dependabot`,
  'i',
);

module.exports = IGNORE_PATTERN;
