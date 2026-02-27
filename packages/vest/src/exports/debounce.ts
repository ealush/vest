/**
 * Module: `src/exports/debounce.ts`.
 *
 * Provides `debounce`-related runtime and type utilities used by `vest`.
 */
import { CB, isPromise, Nullable } from 'vest-utils';
import { Isolate, TIsolate, IsolateSelectors } from 'vestjs-runtime';

import { SuiteContext } from '../core/context/SuiteContext';
import { TIsolateTest } from '../core/isolate/IsolateTest/IsolateTest';
import { getTestFromAbortSignal } from '../core/test/Abortable';
import { TestFn, TestFnPayload } from '../core/test/TestTypes';
import { registerReconciler } from '../vest';

const isolateType = 'Debounce';

export default function debounce<Callback extends CB = CB>(
  callback: Callback,
  delay: number = 0,
): TestFn {
  let abort: Nullable<() => void> = null;
  let timeout: Nullable<NodeJS.Timeout> = null;

  const f = () => (payload: TestFnPayload) => {
    const currentTest =
      getTestFromAbortSignal(payload?.signal) ??
      (SuiteContext.useX().currentTest as TIsolateTest | undefined);

    return new Promise((resolve, reject) => {
      abort = () => {
        if (timeout) {
          clearTimeout(timeout);
        }
        resolve(undefined);
      };

      timeout = setTimeout(() => {
        let res = false;
        try {
          res = SuiteContext.run(
            {
              currentTest,
            },
            () => callback(payload),
          );
        } catch (e) {
          return reject(e);
        }

        if (res === false) {
          return reject();
        }

        return isPromise(res) ? res.then(resolve, reject) : resolve(res);
      }, delay);
    });
  };

  const i = Isolate.create<IsolateDebouncePayload>(isolateType, f, {
    abort: () => {
      if (abort) {
        abort();
      }
    },
  });

  return i.output;
}

class IsolateDebounceReconciler {
  static match(currentNode: TIsolate, historyNode: TIsolate): boolean {
    return (
      IsolateSelectors.isIsolateType(currentNode, isolateType) &&
      IsolateSelectors.isIsolateType(historyNode, isolateType)
    );
  }

  static reconcile(current: TIsolateDebounce, history: TIsolateDebounce) {
    history?.data?.abort?.();

    return current;
  }
}

type TIsolateDebounce = TIsolate<IsolateDebouncePayload>;

type IsolateDebouncePayload = {
  abort: () => void;
};

registerReconciler(IsolateDebounceReconciler);
