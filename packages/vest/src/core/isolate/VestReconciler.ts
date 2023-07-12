import { Nullable } from 'vest-utils';
import { TIsolate } from 'vestjs-runtime';

import { IsolateTestReconciler } from 'IsolateTestReconciler';
import { isIsolateTest } from 'isIsolateTest';

export function VestReconciler(
  currentNode: TIsolate,
  historyNode: TIsolate
): Nullable<TIsolate> {
  if (isIsolateTest(currentNode) && isIsolateTest(historyNode)) {
    return IsolateTestReconciler(currentNode, historyNode);
  }

  return null;
}
