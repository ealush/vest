import dynamicValue from './dynamicValue';
import { DynamicValue, Nullish } from './utilityTypes';

export default function defaultTo<T>(
  value: DynamicValue<Nullish<T>>,
  defaultValue: DynamicValue<T>,
): T {
  return dynamicValue(value) ?? dynamicValue(defaultValue);
}
