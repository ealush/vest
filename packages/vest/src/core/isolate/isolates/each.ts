import { invariant, isFunction } from 'vest-utils';

import { IsolateTypes } from 'IsolateTypes';
import { isolate } from 'isolate';

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
export default function each<T>(
  list: T[],
  callback: (arg: T, index: number) => void
): void {
  invariant(isFunction(callback), 'each callback must be a function');

  isolate({ type: IsolateTypes.EACH }, () => {
    list.forEach((arg, index) => {
      callback(arg, index);
    });
  });
}
