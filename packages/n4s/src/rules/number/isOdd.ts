import { isNumeric, toNumber } from 'vest-utils';

/**
 * Validates that a given value is an odd number
 */
export const isOdd = (value: string | number): boolean => {
  if (isNumeric(value)) {
    const asNumber = toNumber(value).unwrap();
    if (asNumber !== null) {
      return asNumber % 2 !== 0;
    }
  }

  return false;
};
