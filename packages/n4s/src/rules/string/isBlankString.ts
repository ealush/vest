import { isStringValue } from 'vest-utils';

import { isBlank } from 'isBlank';

// Checks if string contains only whitespace characters
export function isBlankString(str: string): boolean {
  return isStringValue(str) && isBlank(str);
}
