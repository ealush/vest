import { bindNot } from '../../lib';

export function isUndefined(value) {
  return value === undefined;
}

export const isNotUndefined = bindNot(isUndefined);
