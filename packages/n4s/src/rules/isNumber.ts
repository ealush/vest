import bindNot from 'bindNot';

export function isNumber(value: any): value is number {
  return Boolean(typeof value === 'number');
}

export const isNotNumber = bindNot(isNumber);
