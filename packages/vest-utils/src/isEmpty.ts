import bindNot from 'bindNot';
import hasOwnProperty from 'hasOwnProperty';
import { lengthEquals } from 'lengthEquals';
import { isObject } from 'valueIsObject';

export function isEmpty(value: unknown): boolean {
  if (!value) {
    return true;
  } else if (hasOwnProperty(value, 'length')) {
    return lengthEquals(value as string | unknown[], 0);
  } else if (isObject(value)) {
    return lengthEquals(Object.keys(value as Record<string, unknown>), 0);
  }

  return false;
}

export const isNotEmpty = bindNot(isEmpty);
