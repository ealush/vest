import bindNot from 'bindNot';
import isString from 'isStringValue';

export function inside(value, arg1) {
  if (Array.isArray(arg1) && /^[s|n|b]/.test(typeof value)) {
    return arg1.indexOf(value) !== -1;
  }

  // both value and arg1 are strings
  if (isString(arg1) && isString(value)) {
    return arg1.indexOf(value) !== -1;
  }

  return false;
}

export const notInside = bindNot(inside);
