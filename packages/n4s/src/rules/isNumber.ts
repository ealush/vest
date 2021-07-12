import bindNot from 'bindNot';

export function isNumber(value: unknown): value is number {
  return Boolean(typeof value === 'number');
}

export const isNotNumber = bindNot(isNumber);
