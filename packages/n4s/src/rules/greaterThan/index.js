import isNumeric from '../isNumeric';

function greaterThan(value, arg1) {
  return isNumeric(value) && isNumeric(arg1) && Number(value) > Number(arg1);
}

greaterThan.alias = 'gt';

export default greaterThan;
