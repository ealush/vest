import { bindNot } from '../../lib';

export function isTruthy(value) {
  return !!value;
}

export const isFalsy = bindNot(isTruthy);
