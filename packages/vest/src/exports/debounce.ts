import { registerReconciler } from 'vest';
import { CB, isPromise, Nullable } from 'vest-utils';
import { Isolate, TIsolate, IsolateSelectors } from 'vestjs-runtime';

import { TestFn, TestFnPayload } from 'TestTypes';

const isolateType = 'Debounce';

export default function debounce<Callback extends CB = CB>(
  callback: Callback,
  delay: number = 0,
): TestFn {
  let timeout: Nullable<NodeJS.Timeout> = null;

  const f = () => (payload: TestFnPayload) =>
    new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
        let res = false;
        try {
          res = callback(payload);
        } catch (e) {
          return reject(e);
        }

        if (res === false) {
          return reject();
        }

        return isPromise(res) ? res.then(resolve, reject) : resolve(res);
      }, delay);
    });

  const i = Isolate.create(isolateType, f, {
    clearTimeout: () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    },
  });

  return i.output;
}

export class IsolateDebounceReconciler {
  static match(currentNode: TIsolate, historyNode: TIsolate): boolean {
    return (
      IsolateSelectors.isIsolateType(currentNode, isolateType) &&
      IsolateSelectors.isIsolateType(historyNode, isolateType)
    );
  }

  static reconcile(current: TIsolateDebounce, history: TIsolateDebounce) {
    history?.data?.clearTimeout?.();

    return current;
  }
}

export type TIsolateDebounce = TIsolate<IsolateDebouncePayload>;

export type IsolateDebouncePayload = {
  clearTimeout: () => void;
};

registerReconciler(IsolateDebounceReconciler);
