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
