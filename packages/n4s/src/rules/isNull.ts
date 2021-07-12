import bindNot from 'bindNot';

export function isNull(value: unknown): value is null {
  return value === null;
}

export const isNotNull = bindNot(isNull);
