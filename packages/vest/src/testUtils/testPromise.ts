/**
 * Module: `src/testUtils/testPromise.ts`.
 *
 * Provides `testPromise`-related runtime and type utilities used by `vest`.
 */
export function TestPromise(cb: (_done: () => void) => void): Promise<void> {
  return new Promise<void>(done => cb(done));
}
