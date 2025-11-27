import {
  KEYWORD_MAJOR,
  KEYWORD_MINOR,
  KEYWORD_PATCH,
  KEYWORDS_MAJOR,
  KEYWORDS_MINOR,
} from './releaseKeywords.js';

const REGEXP_MAJOR = new RegExp(`(${KEYWORDS_MAJOR.join('|')})((.+))?:`, 'i');
const REGEXP_MINOR = new RegExp(`(${KEYWORDS_MINOR.join('|')})((.+))?:`, 'i');

export type ChangeLevel =
  | typeof KEYWORD_MAJOR
  | typeof KEYWORD_MINOR
  | typeof KEYWORD_PATCH;

const determineChangeLevel = (...messages: string[]): ChangeLevel => {
  return messages.reduce<ChangeLevel>((keyword, message) => {
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
  }, KEYWORD_PATCH as ChangeLevel);
};

export default determineChangeLevel;
