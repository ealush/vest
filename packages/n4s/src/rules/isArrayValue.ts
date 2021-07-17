import bindNot from 'bindNot';

// The module is named "isArrayValue" since it
// is conflicting with a nested npm dependency.
// We may need to revisit this in the future.

export function isArray(value: unknown): value is Array<unknown> {
  return Boolean(Array.isArray(value));
}

export const isNotArray = bindNot(isArray);
