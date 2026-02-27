/**
 * Module: `src/IO.ts`.
 *
 * Provides `IO`-related runtime and type utilities used by `vest-utils`.
 */
// IO represents a deferred computation. Executing the function performs the effect.
export type IO<T> = () => T;
