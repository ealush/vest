import { isNumeric } from 'vest-utils';

import type { RuleValue } from 'runtimeRules';
/**
 * Validates that a given value is an odd number
 */
export const isOdd = (value: RuleValue): boolean => {
  if (isNumeric(value)) {
    return value % 2 !== 0;
  }

  return false;
};
