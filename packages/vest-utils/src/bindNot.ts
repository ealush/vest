/**
 * Module: `src/bindNot.ts`.
 *
 * Provides `bindNot`-related runtime and type utilities used by `vest-utils`.
 */
export default function bindNot<T extends (...args: any[]) => unknown>(fn: T) {
  return (...args: Parameters<T>): boolean => !fn(...args);
}
