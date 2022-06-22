import bindNot from 'bindNot';

export function isUndefined(value?: unknown): value is undefined {
  return value === undefined;
}

export const isNotUndefined = bindNot(isUndefined);
