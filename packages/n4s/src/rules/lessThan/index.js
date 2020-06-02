import isNumeric from '../isNumeric';

function lessThan(value, arg1) {
  return isNumeric(value) && isNumeric(arg1) && Number(value) < Number(arg1);
}

lessThan.alias = 'lt';

export default lessThan;
