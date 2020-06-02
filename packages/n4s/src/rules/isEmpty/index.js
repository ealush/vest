import isNumeric from '../isNumeric';

function isEmpty(value) {
  if (!value) {
    return true;
  } else if (isNumeric(value)) {
    return value === 0;
  } else if (Object.prototype.hasOwnProperty.call(value, 'length')) {
    return value.length === 0;
  } else if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  } else {
    return true;
  }
}

isEmpty.negativeForm = 'isNotEmpty';

export default isEmpty;
