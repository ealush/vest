/**
 * Common container predicates for arrays and strings
 */

function isStringContainment(value: unknown, container: unknown): boolean {
  return typeof container === 'string' && typeof value === 'string';
}

function checkAllItemsInSet<T>(items: T[], set: Set<T>): boolean {
  for (const item of items) {
    if (!set.has(item)) return false;
  }
  return true;
}

function checkAnyItemNotInSet<T>(items: T[], set: Set<T>): boolean {
  for (const item of items) {
    if (!set.has(item)) return true;
  }
  return false;
}

export function inside<T>(value: T, container: T[] | string): boolean {
  if (isStringContainment(value, container)) {
    return (container as string).includes(value as string);
  }

  if (Array.isArray(container)) {
    const set = new Set(container as T[]);
    return Array.isArray(value)
      ? checkAllItemsInSet(value, set)
      : set.has(value as T);
  }

  return false;
}

export function notInside<T>(value: T, container: any): boolean {
  if (isStringContainment(value, container)) {
    return !(container as string).includes(value as string);
  }

  if (Array.isArray(container)) {
    const set = new Set(container as T[]);
    return Array.isArray(value)
      ? checkAnyItemNotInSet(value, set)
      : !set.has(value as T);
  }

  return true;
}
