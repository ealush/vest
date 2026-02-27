/**
 * Module: `src/isNull.ts`.
 *
 * Provides `isNull`-related runtime and type utilities used by `vest-utils`.
 */
import bindNot from './bindNot';

export function isNull(value: unknown): value is null {
  return value === null;
}

export const isNotNull = bindNot(isNull);
