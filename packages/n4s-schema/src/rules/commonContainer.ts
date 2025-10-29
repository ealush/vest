/**
 * Common container predicates for arrays and strings
 */

export function inside<T>(value: T, container: T[] | string): boolean {
  if (typeof container === 'string' && typeof value === 'string') {
    return container.includes(value);
  }
  if (Array.isArray(container)) {
    return container.includes(value);
  }
  return false;
}

export function notInside<T>(value: T, container: T[] | string): boolean {
  return !inside(value, container);
}
