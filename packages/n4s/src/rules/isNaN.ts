import { bindNot } from 'vest-utils';

export function isNaN(value: unknown): boolean {
  return Number.isNaN(value);
}

export const isNotNaN = bindNot(isNaN);
