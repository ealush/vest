import { isNumeric } from 'isNumeric';

/**
 * Validates that a given value is an even number
 * @param {Number|String} value Value to be validated
 * @return {Boolean}
 */
export const isEven = value => {
  if (!isNumeric(value)) {
    return false;
  }

  return value % 2 === 0;
};
