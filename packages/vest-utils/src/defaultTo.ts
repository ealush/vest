/**
 * Module: `src/defaultTo.ts`.
 *
 * Provides `defaultTo`-related runtime and type utilities used by `vest-utils`.
 */
import dynamicValue from './dynamicValue';
import { DynamicValue, Nullish } from './utilityTypes';

export default function defaultTo<T>(
  value: DynamicValue<Nullish<T>>,
  defaultValue: DynamicValue<T>,
): T {
  return dynamicValue(value) ?? dynamicValue(defaultValue);
}
