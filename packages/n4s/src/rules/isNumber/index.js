import { bindNot } from '../../lib';

export function isNumber(value) {
  return Boolean(typeof value === 'number');
}

export const isNotNumber = bindNot(isNumber);
