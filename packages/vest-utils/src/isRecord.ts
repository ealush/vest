import { isArray } from './isArrayValue';
import { isObject } from './valueIsObject';

/**
 * Whether a value is a non-null object that is not an array.
 *
 * This deliberately does not require a plain-object prototype. It is the
 * record-shaped counterpart to isObject, whose contract includes arrays.
 */
export function isRecord(
  value: unknown,
): value is Record<PropertyKey, unknown> {
  return isObject(value) && !isArray(value);
}
