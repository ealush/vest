import type { CB } from 'vest-utils';
import { optionalFunctionValue } from 'vest-utils';
import { Isolate } from 'vestjs-runtime';

import { SuiteContext, useOmitted } from 'SuiteContext';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';
import { TDraftCondition } from 'getTypedMethods';
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
  conditional: TDraftCondition<F, G>,
  callback: CB
): void {
  Isolate.create(
    VestIsolateType.OmitWhen,
    () => {
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
    },
    {}
  );
}

// Checks that we're currently in an active omitWhen block
export function useWithinActiveOmitWhen(): boolean {
  return useOmitted();
}
