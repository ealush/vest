import bindNot from 'bindNot';

export function isTruthy(value) {
  return !!value;
}

export const isFalsy = bindNot(isTruthy);
