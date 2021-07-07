import isString from 'isStringValue';

import bindNot from 'bindNot';

export function endsWith(value: string, arg1: string): boolean {
  return isString(value) && isString(arg1) && value.endsWith(arg1);
}

export const doesNotEndWith = bindNot(endsWith);
