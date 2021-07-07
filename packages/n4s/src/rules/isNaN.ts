import bindNot from 'bindNot';

export function isNaN(value: any): boolean {
  return Number.isNaN(value);
}

export const isNotNaN = bindNot(isNaN);
