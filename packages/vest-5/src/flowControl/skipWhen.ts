import { CB, optionalFunctionValue } from 'vest-utils';

import { IsolateTypes } from 'IsolateTypes';
import { SuiteContext, useSkipped } from 'SuiteContext';
import { isolate } from 'isolate';
import { suiteResult, SuiteResult } from 'suiteResult';

/**
 * Conditionally skips running tests within the callback.
 *
 * @example
 *
 * skipWhen(res => res.hasErrors('username'), () => {
 *  test('username', 'User already taken', async () => await doesUserExist(username)
 * });
 */
export function skipWhen(
  condition: boolean | ((draft: SuiteResult) => boolean),
  callback: CB
): void {
  isolate(IsolateTypes.SKIP_WHEN, () => {
    SuiteContext.run(
      {
        skipped:
          // Checking for nested conditional. If we're in a nested skipWhen,
          // we should skip the test if the parent conditional is true.
          isExcludedIndividually() ||
          // Otherwise, we should skip the test if the conditional is true.
          optionalFunctionValue(condition, optionalFunctionValue(suiteResult)),
      },
      callback
    );
  });
}

export function isExcludedIndividually(): boolean {
  return useSkipped();
}
