/**
 * Module: `src/dynamicValue.ts`.
 *
 * Provides `dynamicValue`-related runtime and type utilities used by `vest-utils`.
 */
import isFunction from './isFunction';
import { DynamicValue } from './utilityTypes';

export default function dynamicValue<T>(
  value: DynamicValue<T>,
  ...args: unknown[]
): T {
  return isFunction(value) ? value(...args) : value;
}
