import bindNot from 'bindNot';

export function isNull(value: any): value is null {
  return value === null;
}

export const isNotNull = bindNot(isNull);
