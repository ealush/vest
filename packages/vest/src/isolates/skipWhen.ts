import { CB, optionalFunctionValue } from 'vest-utils';

import { Isolate } from 'Isolate';
import { IsolateTypes } from 'IsolateTypes';
import { SuiteContext, useSkipped } from 'SuiteContext';
import { SuiteResult, TFieldName } from 'SuiteResultTypes';
import { createSuiteResult } from 'suiteResult';

/**
 * Conditionally skips running tests within the callback.
 *
 * @example
 *
 * skipWhen(res => res.hasErrors('username'), () => {
 *  test('username', 'User already taken', async () => await doesUserExist(username)
 * });
 */
export function skipWhen<F extends TFieldName>(
  condition: boolean | ((draft: SuiteResult<F>) => boolean),
  callback: CB
): void {
  Isolate.create(IsolateTypes.SKIP_WHEN, () => {
    SuiteContext.run(
      {
        skipped:
          // Checking for nested conditional. If we're in a nested skipWhen,
          // we should skip the test if the parent conditional is true.
          isExcludedIndividually() ||
          // Otherwise, we should skip the test if the conditional is true.
          optionalFunctionValue(
            condition,
            optionalFunctionValue(createSuiteResult)
          ),
      },
      callback
    );
  });
}

export function isExcludedIndividually(): boolean {
  return useSkipped();
}
