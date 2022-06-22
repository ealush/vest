import { bindNot, isNullish } from 'vest-utils';

export function isValueOf(value: any, objectToCheck: any): boolean {
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
