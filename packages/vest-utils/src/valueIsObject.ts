/**
 * Module: `src/valueIsObject.ts`.
 *
 * Provides `valueIsObject`-related runtime and type utilities used by `vest-utils`.
 */
import { isNullish } from './isNullish';

export function isObject(v: any): v is Record<any, any> {
  return typeof v === 'object' && !isNullish(v);
}
