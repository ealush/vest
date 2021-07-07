import hasOwnProperty from 'hasOwnProperty';

import bindNot from 'bindNot';
import { isNumeric } from 'isNumeric';
import { lengthEquals } from 'lengthEquals';

export function isEmpty(value: unknown): boolean {
  if (!value) {
    return true;
  } else if (isNumeric(value)) {
    return value === 0;
  } else if (hasOwnProperty(value, 'length')) {
    return lengthEquals(value as string | unknown[], 0);
  } else if (typeof value === 'object') {
    return lengthEquals(Object.keys(value as Record<string, unknown>), 0);
  }

  return true;
}

export const isNotEmpty = bindNot(isEmpty);
