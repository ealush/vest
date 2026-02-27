/**
 * Module: `src/isBooleanValue.ts`.
 *
 * Provides `isBooleanValue`-related runtime and type utilities used by `vest-utils`.
 */
export default function isBoolean(value: unknown): value is boolean {
  return !!value === value;
}
