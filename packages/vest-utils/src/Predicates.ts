import { isEmpty } from 'isEmpty';

export type Predicate<T> = (value: T) => boolean;

export function all<T = any>(...p: Predicate<T>[]): (value: T) => boolean {
  return (value: T) =>
    isEmpty(p) ? false : p.every(predicate => predicate(value));
}
