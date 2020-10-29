import bindNot from 'bindNot';

export function isNull(value) {
  return value === null;
}

export const isNotNull = bindNot(isNull);
