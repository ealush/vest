/**
 * Module: `src/isolates/skipWhen.ts`.
 *
 * Provides `skipWhen`-related runtime and type utilities used by `vest`.
 */
import { CB, dynamicValue } from 'vest-utils';
import { TIsolate } from 'vestjs-runtime';

import { SuiteContext, useSkipped } from '../core/context/SuiteContext';
import {
  createVestIsolate,
  VestIsolateType,
} from '../core/isolate/VestIsolateType';
import { TDraftCondition } from '../suite/getTypedMethods';
import { TFieldName, TGroupName } from '../suiteResult/SuiteResultTypes';
import { LazyDraft } from '../suiteResult/selectors/LazyDraft';

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
): TIsolate {
  return createVestIsolate(
    VestIsolateType.SkipWhen,
    () => {
      SuiteContext.run(
        {
          skipped:
            // Checking for nested conditional. If we're in a nested skipWhen,
            // we should skip the test if the parent conditional is true.
            useIsExcludedIndividually() ||
            // Otherwise, we should skip the test if the conditional is true.
            dynamicValue(condition, LazyDraft<F, G>()),
        },
        callback,
      );
    },
    {
      tests: [],
    },
  );
}

export function useIsExcludedIndividually(): boolean {
  return useSkipped();
}
