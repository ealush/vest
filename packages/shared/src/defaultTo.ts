import optionalFunctionValue from 'optionalFunctionValue';

export default function defaultTo<T>(
  callback: T | ((...args: any[]) => T),
  defaultValue: T
): T {
  return optionalFunctionValue(callback) ?? defaultValue;
}
