/**
 * Module: `src/rules/object/isKeyOf.ts`.
 *
 * Provides `isKeyOf`-related runtime and type utilities used by `n4s`.
 */
import { isObject, hasOwnProperty } from 'vest-utils';

// Checks if value is a key that exists in the given object
export function isKeyOf(key: string | number | symbol, obj: object): boolean {
  return isObject(obj) && hasOwnProperty(obj, key);
}

// Checks if value is not a key in the given object
export function isNotKeyOf(
  key: string | number | symbol,
  obj: object,
): boolean {
  return !isObject(obj) || !hasOwnProperty(obj, key);
}
