import bindNot from 'bindNot';
import { isNotNullish } from 'isNullish';
import { isString, isPlainObject } from 'lodash';

export function isValueOf(value: string, objectToCheck: object): boolean {
  return (
    isNotNullish(objectToCheck) &&
    isPlainObject(objectToCheck) &&
    isString(value) &&
    Object.values(objectToCheck).includes(value)
  );
}
export const isNotValueOf = bindNot(isValueOf);
