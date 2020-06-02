import isNumeric from '../isNumeric';

function numberEquals(value, arg1) {
  return isNumeric(value) && isNumeric(arg1) && Number(value) === Number(arg1);
}

numberEquals.negativeForm = 'numberNotEquals';

export default numberEquals;
