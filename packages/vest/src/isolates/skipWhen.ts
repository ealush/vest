import { CB, optionalFunctionValue, isNullish } from 'vest-utils';
import {
  Isolate,
  IsolateInspector,
  IsolateSelectors,
  TIsolate,
} from 'vestjs-runtime';

import { LazyDraft } from 'LazyDraft';
import { SuiteContext, useSkipped } from 'SuiteContext';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';
import type { IsolateReconciler } from 'VestReconciler';
import { TDraftCondition } from 'getTypedMethods';

/**
 * Conditionally skips running tests within the callback.
 *
 * @example
 *
 * skipWhen(res => res.hasErrors('username'), () => {
 *  test('username', 'User already taken', async () => await doesUserExist(username)
 * });
 */
// @vx-allow use-use
export function skipWhen<F extends TFieldName, G extends TGroupName>(
  condition: TDraftCondition<F, G>,
  callback: CB,
): void {
  const payload = {
    skipped:
      // Checking for nested conditional. If we're in a nested skipWhen,
      // we should skip the test if the parent conditional is true.
      useIsExcludedIndividually() ||
      // Otherwise, we should skip the test if the conditional is true.
      optionalFunctionValue(condition, LazyDraft<F, G>()),
  };
  Isolate.create<SkipWhenPayload>(
    VestIsolateType.SkipWhen,
    () => {
      SuiteContext.run(payload, callback);
    },
    { skipped: payload.skipped },
  );
}

export function useIsExcludedIndividually(): boolean {
  return useSkipped();
}

export const SkipWhenReconciler: IsolateReconciler = {
  match(currentNode: TIsolate, historyNode: TIsolate): boolean {
    return (
      IsolateSelectors.isSameIsolateIdentity(currentNode, historyNode) &&
      IsolateSelectors.isIsolateType(currentNode, VestIsolateType.SkipWhen)
    );
  },

  reconcile(
    currentNode: IsolateSkippable,
    historyNode: IsolateSkippable,
  ): IsolateSkippable {
    const data = IsolateInspector.getData<IsolateSkippable>(currentNode);

    if (isNullish(data)) {
      return currentNode;
    }

    if (data.skipped) {
      return historyNode;
    }

    return currentNode;
  },
};

export type SkipWhenPayload = {
  skipped: boolean;
};

export type IsolateSkippable = TIsolate<SkipWhenPayload>;
