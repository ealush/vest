/**
 * Module: `src/rules/object/isValueOf.ts`.
 *
 * Provides `isValueOf`-related runtime and type utilities used by `n4s`.
 */
import { isObject } from 'vest-utils';

// Checks if value exists in the given object's values
export function isValueOf<T = any>(value: T, obj: Record<string, T>): boolean {
  return isObject(obj) && Object.values(obj).includes(value);
}

// Checks if value does not exist in the given object's values
export function isNotValueOf<T = any>(
  value: T,
  obj: Record<string, T>,
): boolean {
  return isObject(obj) && !Object.values(obj).includes(value);
}
