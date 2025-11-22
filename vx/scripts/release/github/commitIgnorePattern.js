const IGNORE_KEYWORDS = ['docs', 'conf', 'ci', 'build'];
/** @type {RegExp} */
const IGNORE_PATTERN = new RegExp(
  `${IGNORE_KEYWORDS.join('|')}:|dependabot`,
  'i',
);

export default IGNORE_PATTERN;
