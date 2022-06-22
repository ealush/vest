import { bindNot } from 'vest-utils';

export function isTruthy(value: unknown): boolean {
  return !!value;
}

export const isFalsy = bindNot(isTruthy);
