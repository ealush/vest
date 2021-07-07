import bindNot from 'bindNot';

export function isUndefined(value?: unknown): boolean {
  return value === undefined;
}

export const isNotUndefined = bindNot(isUndefined);
