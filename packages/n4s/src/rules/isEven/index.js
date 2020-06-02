import isNumeric from '../isNumeric';

/**
 * Validates that a given value is an even number
 * @param {Number|String} value Value to be validated
 * @return {Boolean}
 */
const isEven = value => {
  if (!isNumeric(value)) {
    return false;
  }

  return value % 2 === 0;
};

export default isEven;
