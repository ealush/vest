import bindNot from 'bindNot';

export function inside(value, arg1) {
  if (
    Array.isArray(arg1) &&
    ['string', 'number', 'boolean'].indexOf(typeof value) !== -1
  ) {
    return arg1.indexOf(value) !== -1;
  }

  // both value and arg1 are strings
  if (typeof arg1 === 'string' && typeof value === 'string') {
    return arg1.indexOf(value) !== -1;
  }

  return false;
}

export const notInside = bindNot(inside);
