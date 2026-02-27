/**
 * Module: `src/core/isolate/VestReconciler.ts`.
 *
 * Provides `VestReconciler`-related runtime and type utilities used by `vest`.
 */
import { Nullable } from 'vest-utils';
import { TIsolate } from 'vestjs-runtime';

import { IsolateTestReconciler } from './IsolateTest/IsolateTestReconciler';

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
      ?.reconcile(currentNode, historyNode) ?? null
  );
}

type IsolateReconciler = {
  match(currentNode: TIsolate, historyNode: TIsolate): boolean;
  reconcile(currentNode: TIsolate, historyNode: TIsolate): TIsolate;
};
