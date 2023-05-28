import { Isolate } from 'vest-runtime';
import type { CB } from 'vest-utils';
import { optionalFunctionValue } from 'vest-utils';

import { SuiteContext, useOmitted } from 'SuiteContext';
import { SuiteResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { useCreateSuiteResult } from 'suiteResult';

/**
 * Conditionally omits tests from the suite.
 *
 * @example
 *
 * omitWhen(res => res.hasErrors('username'), () => {
 *  test('username', 'User already taken', async () => await doesUserExist(username)
 * });
 */
// @vx-allow use-use
export function omitWhen<F extends TFieldName, G extends TGroupName>(
  conditional: boolean | ((draft: SuiteResult<F, G>) => boolean),
  callback: CB
): void {
  Isolate.create(() => {
    SuiteContext.run(
      {
        omitted:
          useWithinActiveOmitWhen() ||
          optionalFunctionValue(
            conditional,
            optionalFunctionValue(useCreateSuiteResult)
          ),
      },
      callback
    );
  });
}

// Checks that we're currently in an active omitWhen block
export function useWithinActiveOmitWhen(): boolean {
  return useOmitted();
}
