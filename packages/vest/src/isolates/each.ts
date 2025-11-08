import { invariant, isFunction } from 'vest-utils';

import { ErrorStrings } from 'ErrorStrings';
import { IsolateEach } from 'IsolateEach';

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
  callback: (arg: T, index: number) => void,
): void {
  invariant(
    isFunction(callback),
    ErrorStrings.EACH_CALLBACK_MUST_BE_A_FUNCTION,
  );

  IsolateEach(() => {
    list.forEach((arg, index) => {
      callback(arg, index);
    });
  });
}
