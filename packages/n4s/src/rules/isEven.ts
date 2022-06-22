import { isNumeric } from 'vest-utils';

import type { RuleValue } from 'runtimeRules';

/**
 * Validates that a given value is an even number
 */
export const isEven = (value: RuleValue): boolean => {
  if (isNumeric(value)) {
    return value % 2 === 0;
  }
  return false;
};
