import bindNot from 'bindNot';

export function isArray(value: unknown): value is Array<unknown> {
  return Boolean(Array.isArray(value));
}

export const isNotArray = bindNot(isArray);
