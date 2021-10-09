import hasOwnProperty from 'hasOwnProperty';

import bindNot from 'bindNot';
import { isNumeric } from 'isNumeric';
import { lengthEquals } from 'lengthEquals';

export function isEmpty(value) {
  if (!value) {
    return true;
  } else if (typeof value === 'string') {
    return value.trim() === '';
  } else if (isNumeric(value)) {
    return value === 0;
  } else if (hasOwnProperty(value, 'length')) {
    return lengthEquals(value, 0);
  } else if (typeof value === 'object') {
    return lengthEquals(Object.keys(value), 0);
  }

  return true;
}

export const isNotEmpty = bindNot(isEmpty);
