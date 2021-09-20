import bindNot from 'bindNot';
import { isStringValue as isString } from 'isStringValue';

export function endsWith(value: string, arg1: string): boolean {
  return isString(value) && isString(arg1) && value.endsWith(arg1);
}

export const doesNotEndWith = bindNot(endsWith);
