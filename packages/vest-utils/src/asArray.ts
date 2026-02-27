/**
 * Module: `src/asArray.ts`.
 *
 * Provides `asArray`-related runtime and type utilities used by `vest-utils`.
 */
export default function asArray<T>(possibleArg: T | T[]): T[] {
  return ([] as T[]).concat(possibleArg);
}
