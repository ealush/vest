/**
 * Module: `src/deferThrow.ts`.
 *
 * Provides `deferThrow`-related runtime and type utilities used by `vest-utils`.
 */
export default function deferThrow(message?: string): void {
  setTimeout(() => {
    throw new Error(message);
  }, 0);
}

export type TDeferThrow = typeof deferThrow;
