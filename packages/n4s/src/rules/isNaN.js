import bindNot from 'bindNot';

export function isNaN(value) {
  return Number.isNaN(value);
}

export const isNotNaN = bindNot(isNaN);
