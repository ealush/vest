/**
 * Module: `src/isFunction.ts`.
 *
 * Provides `isFunction`-related runtime and type utilities used by `vest-utils`.
 */
export default function isFunction(
  value: unknown,
): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}
