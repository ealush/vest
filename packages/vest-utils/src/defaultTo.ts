import optionalFunctionValue from 'optionalFunctionValue';
import { DynamicValue, Nullish } from 'utilityTypes';

export default function defaultTo<T>(
  value: DynamicValue<Nullish<T>>,
  defaultValue: DynamicValue<T>
): T {
  return optionalFunctionValue(value) ?? optionalFunctionValue(defaultValue);
}
