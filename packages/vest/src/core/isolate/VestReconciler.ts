import { Nullable } from 'vest-utils';
import { Isolate } from 'vestjs-runtime';

import { IsolateTestReconciler } from 'IsolateTestReconciler';
import { isIsolateTest } from 'isIsolateTest';

export function VestReconciler(
  currentNode: Isolate,
  historyNode: Isolate
): Nullable<Isolate> {
  if (isIsolateTest(currentNode) && isIsolateTest(historyNode)) {
    return IsolateTestReconciler(currentNode, historyNode);
  }

  return null;
}
