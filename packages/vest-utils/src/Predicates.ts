import { isEmpty } from 'isEmpty';
import optionalFunctionValue from 'optionalFunctionValue';
import { Predicate } from 'utilityTypes';

export function all<T = any>(...p: Predicate<T>[]): (value: T) => boolean {
  return (value: T) =>
    isEmpty(p)
      ? false
      : p.every(predicate => optionalFunctionValue(predicate, value));
}

export function any<T = any>(...p: Predicate<T>[]): (value: T) => boolean {
  return (value: T) =>
    isEmpty(p)
      ? false
      : p.some(predicate => optionalFunctionValue(predicate, value));
}
