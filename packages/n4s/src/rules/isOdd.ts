import { isNumeric } from 'isNumeric';

/**
 * Validates that a given value is an odd number
 */
export const isOdd = (value: any): boolean => {
  if (isNumeric(value)) {
    return value % 2 !== 0;
  }

  return false;
};
