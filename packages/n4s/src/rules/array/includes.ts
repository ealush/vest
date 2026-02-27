/**
 * Module: `src/rules/array/includes.ts`.
 *
 * Provides `includes`-related runtime and type utilities used by `n4s`.
 */
// Checks if array contains the given item
export function includes<T>(arr: T[], item: T): boolean {
  return Array.isArray(arr) && arr.includes(item as any);
}
