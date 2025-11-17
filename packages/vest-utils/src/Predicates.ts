import dynamicValue from './dynamicValue';
import { isEmpty } from './isEmpty';
import { Predicate } from './utilityTypes';

export function all<T = any>(...p: Predicate<T>[]): (value: T) => boolean {
  return (value: T) =>
    isEmpty(p) ? false : p.every(predicate => dynamicValue(predicate, value));
}

export function any<T = any>(...p: Predicate<T>[]): (value: T) => boolean {
  return (value: T) =>
    isEmpty(p) ? false : p.some(predicate => dynamicValue(predicate, value));
}
