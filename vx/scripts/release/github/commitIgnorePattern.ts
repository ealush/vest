const IGNORE_KEYWORDS = ['docs', 'conf', 'ci', 'build'] as const;

const IGNORE_PATTERN = new RegExp(
  `${IGNORE_KEYWORDS.join('|')}:|dependabot`,
  'i',
);

export default IGNORE_PATTERN;
