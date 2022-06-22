import { isStringValue as isString, bindNot } from 'vest-utils';

export function startsWith(value: string, arg1: string): boolean {
  return isString(value) && isString(arg1) && value.startsWith(arg1);
}

export const doesNotStartWith = bindNot(startsWith);
