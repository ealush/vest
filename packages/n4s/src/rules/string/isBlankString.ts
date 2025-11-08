import { isBlank } from 'isBlank';
import { isStringValue } from 'vest-utils';

// Checks if string contains only whitespace characters
export function isBlankString(str: string): boolean {
  return isStringValue(str) && isBlank(str);
}
