/**
 * Common container predicates for arrays and strings
 */

export function inside<T>(value: T, container: T[] | string): boolean {
  if (typeof container === 'string' && typeof value === 'string') {
    return container.includes(value);
  }
  if (Array.isArray(container)) {
    // If value is an array, check if all its items are in the container
    if (Array.isArray(value)) {
      return value.every(item => container.includes(item));
    }
    return container.includes(value);
  }
  return false;
}

export function notInside<T>(value: T, container: T[] | string): boolean {
  if (typeof container === 'string' && typeof value === 'string') {
    return !container.includes(value);
  }
  if (Array.isArray(container)) {
    // If value is an array, check if at least one item is not in the container
    if (Array.isArray(value)) {
      return value.some(item => !container.includes(item));
    }
    return !container.includes(value);
  }
  return true;
}
