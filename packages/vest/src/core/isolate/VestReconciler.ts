import { Nullable } from 'vest-utils';
import { TIsolate } from 'vestjs-runtime';

import { IsolateTestReconciler } from 'IsolateTestReconciler';

export function VestReconciler(
  currentNode: TIsolate,
  historyNode: TIsolate
): Nullable<TIsolate> {
  return (
    [IsolateTestReconciler]
      .find(reconciler => reconciler.match(currentNode, historyNode))
      ?.reconcile(currentNode as any, historyNode as any) ?? null
  );
}
