import bindNot from 'bindNot';

export function equals(value: unknown, arg1: unknown): boolean {
  return value === arg1;
}

export const notEquals = bindNot(equals);
