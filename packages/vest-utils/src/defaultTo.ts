import optionalFunctionValue from 'optionalFunctionValue';

export default function defaultTo<T>(
  value: T | ((...args: any[]) => T),
  defaultValue: T | (() => T)
): T {
  return optionalFunctionValue(value) ?? optionalFunctionValue(defaultValue);
}
