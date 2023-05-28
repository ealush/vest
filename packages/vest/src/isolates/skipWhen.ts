import { Isolate } from 'vest-runtime';
import { CB, optionalFunctionValue } from 'vest-utils';

import { SuiteContext, useSkipped } from 'SuiteContext';
import { SuiteResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { useCreateSuiteResult } from 'suiteResult';

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
  condition: boolean | ((draft: SuiteResult<F, G>) => boolean),
  callback: CB
): void {
  Isolate.create(() => {
    SuiteContext.run(
      {
        skipped:
          // Checking for nested conditional. If we're in a nested skipWhen,
          // we should skip the test if the parent conditional is true.
          useIsExcludedIndividually() ||
          // Otherwise, we should skip the test if the conditional is true.
          optionalFunctionValue(
            condition,
            optionalFunctionValue(useCreateSuiteResult)
          ),
      },
      callback
    );
  });
}

export function useIsExcludedIndividually(): boolean {
  return useSkipped();
}
