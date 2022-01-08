import bindNot from 'bindNot';
import { isNotNullish } from 'isNullish';
import { isString, isPlainObject } from 'lodash';

export function isValueOf(value: string, objectToCheck: object): boolean {

  if (isNullish(objectToCheck)) {
    return false;
  }

  for (const key in objectToCheck) {
    if (objectToCheck[key] === value) {
      return true;
    }
  }
  
  return false;
}
export const isNotValueOf = bindNot(isValueOf);
