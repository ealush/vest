import { bindNot } from '../../lib';

export function isString(value) {
  return Boolean(typeof value === 'string');
}

export const isNotString = bindNot(isString);
