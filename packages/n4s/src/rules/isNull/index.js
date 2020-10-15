import { bindNot } from '../../lib';

export function isNull(value) {
  return value === null;
}

export const isNotNull = bindNot(isNull);
