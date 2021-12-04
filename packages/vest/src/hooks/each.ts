import isFunction from 'isFunction';
import throwError from 'throwError';

import { IsolateTypes } from 'IsolateTypes';
import { isolate } from 'isolate';

export default function each<T>(
  list: T[],
  callback: (arg: T, index: number) => void
): void {
  if (!isFunction(callback)) {
    throwError('callback must be a function');
  }

  isolate({ type: IsolateTypes.EACH }, () => {
    list.forEach((arg, index) => {
      callback(arg, index);
    });
  });
}
