import { isNumeric } from 'vest-utils';

import { toNumberStrict } from 'toNumber';

/**
 * Validates that a given value is an odd number
 */
export const isOdd = (value: string | number): boolean => {
  if (isNumeric(value)) {
    return toNumberStrict(value) % 2 !== 0;
  }

  return false;
};
