import isNumeric from '../isNumeric';

function greaterThanOrEquals(value, arg1) {
  return isNumeric(value) && isNumeric(arg1) && Number(value) >= Number(arg1);
}

greaterThanOrEquals.alias = 'gte';

export default greaterThanOrEquals;
