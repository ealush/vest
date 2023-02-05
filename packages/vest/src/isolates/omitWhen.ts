import type { CB } from 'vest-utils';
import { optionalFunctionValue } from 'vest-utils';

import { IsolateTypes } from 'IsolateTypes';
import { SuiteContext, useOmitted } from 'SuiteContext';
import { SuiteResult, TFieldName } from 'SuiteResultTypes';
import { Isolate } from 'isolate';
import { createSuiteResult } from 'suiteResult';

/**
 * Conditionally omits tests from the suite.
 *
 * @example
 *
 * omitWhen(res => res.hasErrors('username'), () => {
 *  test('username', 'User already taken', async () => await doesUserExist(username)
 * });
 */
export function omitWhen<F extends TFieldName>(
  conditional: boolean | ((draft: SuiteResult<F>) => boolean),
  callback: CB
): void {
  Isolate.create(IsolateTypes.OMIT_WHEN, () => {
    SuiteContext.run(
      {
        omitted:
          withinActiveOmitWhen() ||
          optionalFunctionValue(
            conditional,
            optionalFunctionValue(createSuiteResult)
          ),
      },
      callback
    );
  });
}

// Checks that we're currently in an active omitWhen block
export function withinActiveOmitWhen(): boolean {
  return useOmitted();
}
