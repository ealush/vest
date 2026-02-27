/**
 * Module: `src/isUnsafeKey.ts`.
 *
 * Provides `isUnsafeKey`-related runtime and type utilities used by `vest-utils`.
 */
export default function isUnsafeKey(key: string): boolean {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
}
