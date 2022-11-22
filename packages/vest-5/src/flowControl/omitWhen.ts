import { IsolateTypes } from 'IsolateTypes';
import type { CB } from 'vest-utils';
import { optionalFunctionValue } from 'vest-utils';

import { SuiteContext, useOmitted } from 'SuiteContext';
import { isolate } from 'isolate';
import { suiteResult, SuiteResult } from 'suiteResult';

/**
 * Conditionally omits tests from the suite.
 *
 * @example
 *
 * omitWhen(res => res.hasErrors('username'), () => {
 *  test('username', 'User already taken', async () => await doesUserExist(username)
 * });
 */
export function omitWhen(
  conditional: boolean | ((draft: SuiteResult) => boolean),
  callback: CB
): void {
  isolate(IsolateTypes.OMIT_WHEN, () => {
    SuiteContext.run(
      {
        omitted:
          withinActiveOmitWhen() ||
          optionalFunctionValue(
            conditional,
            optionalFunctionValue(suiteResult)
          ),
      },
      () => callback()
    );
  });
}

// Checks that we're currently in an active omitWhen block
export function withinActiveOmitWhen(): boolean {
  return useOmitted();
}
