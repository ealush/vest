import bindNot from 'bindNot';

export function isUndefined(value) {
  return value === undefined;
}

export const isNotUndefined = bindNot(isUndefined);
