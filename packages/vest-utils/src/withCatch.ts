/**
 * Module: `src/withCatch.ts`.
 *
 * Provides `withCatch`-related runtime and type utilities used by `vest-utils`.
 */
import { CB } from './utilityTypes';

export function withCatch<T>(cb: CB<T>): () => T | unknown {
  return () => {
    try {
      return cb();
    } catch (error) {
      return error;
    }
  };
}
