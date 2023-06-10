import optionalFunctionValue from 'optionalFunctionValue';
import { Nullish } from 'utilityTypes';

export default function defaultTo<T>(
  value: Nullish<T> | ((...args: any[]) => Nullish<T>),
  defaultValue: T | (() => T)
): T {
  return optionalFunctionValue(value) ?? optionalFunctionValue(defaultValue);
}
