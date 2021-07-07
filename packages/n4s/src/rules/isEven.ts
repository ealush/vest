import { isNumeric } from 'isNumeric';

/**
 * Validates that a given value is an even number
 * @param {Number|String} value Value to be validated
 * @return {Boolean}
 */
export const isEven = (value: any): boolean => {
  if (isNumeric(value)) {
    return value % 2 === 0;
  }
  return false;
};
