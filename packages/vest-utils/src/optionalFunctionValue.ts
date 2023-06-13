import isFunction from 'isFunction';
import { DynamicValue } from 'utilityTypes';

export default function optionalFunctionValue<T>(
  value: DynamicValue<T>,
  ...args: unknown[]
): T {
  return isFunction(value) ? value(...args) : value;
}
