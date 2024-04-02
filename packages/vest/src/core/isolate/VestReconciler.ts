import { Nullable } from 'vest-utils';
import { TIsolate } from 'vestjs-runtime';

import { IsolateTestReconciler } from 'IsolateTestReconciler';

const reconcilers: IsolateReconciler[] = [IsolateTestReconciler];

export function registerReconciler(reconciler: IsolateReconciler) {
  if (reconcilers.includes(reconciler)) {
    return;
  }

  reconcilers.push(reconciler);
}

export function VestReconciler(
  currentNode: TIsolate,
  historyNode: TIsolate,
): Nullable<TIsolate> {
  return (
    reconcilers
      .find(reconciler => reconciler.match(currentNode, historyNode))
      ?.reconcile(currentNode as any, historyNode as any) ?? null
  );
}

export type IsolateReconciler = {
  match(currentNode: TIsolate, historyNode: TIsolate): boolean;
  reconcile(elecurrentNode: TIsolate, historyNode: TIsolate): TIsolate;
};
