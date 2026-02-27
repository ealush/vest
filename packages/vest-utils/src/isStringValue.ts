/**
 * Module: `src/isStringValue.ts`.
 *
 * Provides `isStringValue`-related runtime and type utilities used by `vest-utils`.
 */
export default function isStringValue(v: unknown): v is string {
  return String(v) === v;
}
