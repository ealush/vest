import { invariant, isFunction } from 'vest-utils';

import { Isolate } from 'Isolate';
import { IsolateTypes } from 'IsolateTypes';

/**
 * Iterates over an array of items, allowing to run tests individually per item.
 *
 * Requires setting a "key" property on each item tested.
 *
 * @example
 *
 * each(itemsArray, (item) => {
 *  test(item.name, 'Item value must not be empty', () => {
 *    enforce(item.value).isNotEmpty();
 *  }, item.id)
 * })
 */
export function each<T>(
  list: T[],
  callback: (arg: T, index: number) => void
): void {
  invariant(isFunction(callback), 'each callback must be a function');

  Isolate.create(IsolateTypes.EACH, () => {
    list.forEach((arg, index) => {
      callback(arg, index);
    });
  });
}
