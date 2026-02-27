/**
 * Module: `src/rules/string/isBlankString.ts`.
 *
 * Provides `isBlankString`-related runtime and type utilities used by `n4s`.
 */
import { isStringValue } from 'vest-utils';

import { isBlank } from '../general/isBlank';

// Checks if string contains only whitespace characters
export function isBlankString(str: string): boolean {
  return isStringValue(str) && isBlank(str);
}
