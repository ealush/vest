import isNumeric from '../isNumeric';

function isNegative(value) {
  if (isNumeric(value)) {
    return Number(value) < 0;
  }
  return false;
}
isNegative.negativeForm = 'isPositive';
export default isNegative;
