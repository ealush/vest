import bindNot from 'bindNot';

export function equals(value, arg1) {
  return value === arg1;
}

export const notEquals = bindNot(equals);
