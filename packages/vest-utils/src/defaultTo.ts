import optionalFunctionValue from 'optionalFunctionValue';

export default function defaultTo<T>(
  value: T | void | null | ((...args: any[]) => T | void | null),
  defaultValue: T | (() => T)
): T {
  return optionalFunctionValue(value) ?? optionalFunctionValue(defaultValue);
}
