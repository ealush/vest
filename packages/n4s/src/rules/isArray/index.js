import { bindNot } from '../../lib';

export function isArray(value) {
  return Boolean(Array.isArray(value));
}

export const isNotArray = bindNot(isArray);
