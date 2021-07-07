import bindNot from 'bindNot';

export function isTruthy(value: unknown): boolean {
  return !!value;
}

export const isFalsy = bindNot(isTruthy);
