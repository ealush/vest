import bindNot from 'bindNot';
import isString from 'isStringValue';

export function endsWith(value, arg1) {
  return isString(value) && isString(arg1) && value.endsWith(arg1);
}

export const doesNotEndWith = bindNot(endsWith);
