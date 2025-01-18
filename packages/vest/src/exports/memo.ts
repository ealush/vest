import { registerReconciler } from 'vest';
import { CB, lengthEquals } from 'vest-utils';
import { Isolate, TIsolate, IsolateSelectors, Walker } from 'vestjs-runtime';

import { TIsolateTest } from 'IsolateTest';
import { VestTest } from 'VestTest';

const isolateType = 'Memo';

export function memo<Callback extends CB = CB>(
  callback: Callback,
  dependencies: unknown[],
) {
  return Isolate.create(isolateType, callback, { dependencies });
}

export class IsolateMemoReconciler {
  static match(currentNode: TIsolate, historyNode: TIsolate): boolean {
    return (
      IsolateSelectors.isIsolateType(currentNode, isolateType) &&
      IsolateSelectors.isIsolateType(historyNode, isolateType)
    );
  }

  static reconcile(current: TIsolateMemo, history: TIsolateMemo) {
    const shouldUseHistory =
      lengthEquals(
        current.data.dependencies,
        history.data.dependencies.length,
      ) &&
      current.data.dependencies.every(
        (dep, i) => dep === history.data.dependencies[i],
      );

    if (!shouldUseHistory) {
      return current;
    }

    const isCanceled = Walker.some(
      history,
      i => VestTest.isCanceled(i as TIsolateTest),
      VestTest.is,
    );

    return isCanceled ? current : history;
  }
}

export type TIsolateMemo = TIsolate<IsolateMemoPayload>;

export type IsolateMemoPayload = {
  dependencies: unknown[];
};

registerReconciler(IsolateMemoReconciler);
