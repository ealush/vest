/**
 * Module: `src/isPromise.ts`.
 *
 * Provides `isPromise`-related runtime and type utilities used by `vest-utils`.
 */
import isFunction from './isFunction';

export default function isPromise(value: any): value is Promise<unknown> {
  return !!value && isFunction(value.then);
}
