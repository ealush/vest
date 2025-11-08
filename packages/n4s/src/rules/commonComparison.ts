/**
 * Common comparison predicates that work across multiple types
 */

export function equals<T>(a: T, b: T): boolean {
  return a === b;
}

export function notEquals<T>(a: T, b: T): boolean {
  return a !== b;
}

export function greaterThan<T extends number | string>(a: T, b: T): boolean {
  return a > b;
}

export function greaterThanOrEquals<T extends number | string>(
  a: T,
  b: T,
): boolean {
  return a >= b;
}

export function lessThan<T extends number | string>(a: T, b: T): boolean {
  return a < b;
}

export function lessThanOrEquals<T extends number | string>(
  a: T,
  b: T,
): boolean {
  return a <= b;
}
