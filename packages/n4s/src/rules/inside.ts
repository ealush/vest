import { isStringValue as isString, bindNot, isArray } from 'vest-utils';

export function inside(value: unknown, arg1: string | unknown[]): boolean {
  if (isArray(arg1)) {
    return arg1.indexOf(value) !== -1;
  }

  // both value and arg1 are strings
  if (isString(arg1) && isString(value)) {
    return arg1.indexOf(value) !== -1;
  }

  return false;
}

export const notInside = bindNot(inside);
