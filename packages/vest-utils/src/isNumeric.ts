/**
 * Module: `src/isNumeric.ts`.
 *
 * Provides `isNumeric`-related runtime and type utilities used by `vest-utils`.
 */
import bindNot from './bindNot';

export function isNumeric(value: string | number): boolean {
  const str = String(value);
  const num = Number(value);
  const result =
    !isNaN(parseFloat(str)) && !isNaN(Number(value)) && isFinite(num);
  return Boolean(result);
}

export const isNotNumeric = bindNot(isNumeric);
