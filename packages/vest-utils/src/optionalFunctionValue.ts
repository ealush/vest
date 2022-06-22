import isFunction from 'isFunction';

export default function optionalFunctionValue<T>(
  value: T | ((...args: any[]) => T),
  ...args: unknown[]
): T {
  return isFunction(value) ? value(...args) : value;
}
