import { isNumeric } from 'isNumeric';
import type { TRuleValue } from 'runtimeRules';

/**
 * Validates that a given value is an even number
 */
export const isEven = (value: TRuleValue): boolean => {
  if (isNumeric(value)) {
    return value % 2 === 0;
  }
  return false;
};
