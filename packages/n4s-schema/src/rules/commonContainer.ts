/**
 * Common container predicates for arrays and strings
 */

export function inside<T>(value: T, container: T[] | string): boolean {
  if (typeof container === 'string' && typeof value === 'string') {
    return container.includes(value);
  }
  if (Array.isArray(container)) {
    // Optimize membership checks using a Set for O(1) lookups
    const set = new Set(container as T[]);
    if (Array.isArray(value)) {
      // All items must be present in container
      for (const item of value) {
        if (!set.has(item)) return false;
      }
      return true;
    }
    return set.has(value as T);
  }
  return false;
}

export function notInside<T>(value: T, container: T[] | string): boolean {
  if (typeof container === 'string' && typeof value === 'string') {
    return !container.includes(value);
  }
  if (Array.isArray(container)) {
    const set = new Set(container as T[]);
    if (Array.isArray(value)) {
      // At least one item must be absent from container
      for (const item of value) {
        if (!set.has(item)) return true;
      }
      return false;
    }
    return !set.has(value as T);
  }
  return true;
}
