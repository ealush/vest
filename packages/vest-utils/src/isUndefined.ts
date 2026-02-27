/**
 * Module: `src/isUndefined.ts`.
 *
 * Provides `isUndefined`-related runtime and type utilities used by `vest-utils`.
 */
import bindNot from './bindNot';

export function isUndefined(value?: unknown): value is undefined {
  return value === undefined;
}

export const isNotUndefined = bindNot(isUndefined);
