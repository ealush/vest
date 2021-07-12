import { isNumeric } from 'isNumeric';

/**
 * Validates that a given value is an even number
 */
export const isEven = (value: any): boolean => {
  if (isNumeric(value)) {
    return value % 2 === 0;
  }
  return false;
};
