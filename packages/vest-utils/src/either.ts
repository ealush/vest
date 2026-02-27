/**
 * Module: `src/either.ts`.
 *
 * Provides `either`-related runtime and type utilities used by `vest-utils`.
 */
export default function either(a: unknown, b: unknown): boolean {
  return !!a !== !!b;
}
