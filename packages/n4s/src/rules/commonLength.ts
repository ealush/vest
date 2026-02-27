/**
 * Module: `src/rules/commonLength.ts`.
 *
 * Provides `commonLength`-related runtime and type utilities used by `n4s`.
 */
// Shared length-based predicates for strings and arrays.
// Works on any value with a .length property.

type Lengthable = { length: number };

export function minLength(value: Lengthable, n: number): boolean {
  return value.length >= n;
}

export function maxLength(value: Lengthable, n: number): boolean {
  return value.length <= n;
}

export const min = minLength;
export const max = maxLength;

export function lengthEquals(value: Lengthable, n: number): boolean {
  return value.length === n;
}

export function lengthNotEquals(value: Lengthable, n: number): boolean {
  return value.length !== n;
}

export function longerThan(value: Lengthable, n: number): boolean {
  return value.length > n;
}

export function longerThanOrEquals(value: Lengthable, n: number): boolean {
  return value.length >= n;
}

export function shorterThan(value: Lengthable, n: number): boolean {
  return value.length < n;
}

export function shorterThanOrEquals(value: Lengthable, n: number): boolean {
  return value.length <= n;
}
