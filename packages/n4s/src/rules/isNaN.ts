import bindNot from 'bindNot';

export function isNaN(value: unknown): boolean {
  return Number.isNaN(value);
}

export const isNotNaN = bindNot(isNaN);
