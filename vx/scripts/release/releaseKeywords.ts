export const KEYWORD_PATCH = 'patch';
export const KEYWORD_MINOR = 'minor';
export const KEYWORD_FEAT = 'feat';
export const KEYWORD_ADDED = 'added';
export const KEYWORD_ADD = 'add';
export const KEYWORD_MAJOR = 'major';
export const KEYWORD_BREAKING = 'breaking';

// Tag constants for release branches
export const TAG_NEXT = 'next';
export const TAG_DEV = 'dev';

export const KEYWORDS_MINOR = [
  KEYWORD_MINOR,
  KEYWORD_FEAT,
  KEYWORD_ADDED,
  KEYWORD_ADD,
] as const;
export const KEYWORDS_MAJOR = [KEYWORD_MAJOR, KEYWORD_BREAKING] as const;

export const CHANGELOG_TITLES: Record<string, string> = {
  [KEYWORD_MAJOR]: 'Changed or removed',
  [KEYWORD_MINOR]: 'Added',
  [KEYWORD_PATCH]: 'Fixed and improved',
};
