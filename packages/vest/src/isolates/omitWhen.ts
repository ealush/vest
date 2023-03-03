import type { CB } from 'vest-utils';
import { optionalFunctionValue } from 'vest-utils';

import { SuiteContext, useOmitted } from 'SuiteContext';
import { SuiteResult, TFieldName } from 'SuiteResultTypes';
import { Isolate } from 'isolate';
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
export function omitWhen<F extends TFieldName>(
  conditional: boolean | ((draft: SuiteResult<F>) => boolean),
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
