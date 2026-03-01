import { CB } from './utilityTypes';

export function withCatch<F extends CB>(
  cb: F,
): (...args: Parameters<F>) => ReturnType<F> | unknown {
  return (...args: Parameters<F>) => {
    try {
      return cb(...args);
    } catch (error) {
      return error;
    }
  };
}
