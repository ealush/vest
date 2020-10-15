import { bindNot } from '../../lib';

export function isNaN(value) {
  return Number.isNaN(value);
}

export const isNotNaN = bindNot(isNaN);
