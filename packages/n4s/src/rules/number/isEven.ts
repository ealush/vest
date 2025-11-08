import { isNumeric } from 'vest-utils';

import { toNumber } from 'toNumber';

/**
 * Validates that a given value is an even number
 */
export const isEven = (value: string | number): boolean => {
  if (isNumeric(value)) {
    const asNumber = toNumber(value);

    if (asNumber !== null) {
      return asNumber % 2 === 0;
    }
  }

  return false;
};
