import bindNot from 'bindNot';
import isString from 'isStringValue';

export function startsWith(value, arg1) {
  return isString(value) && isString(arg1) && value.startsWith(arg1);
}

export const doesNotStartWith = bindNot(startsWith);
