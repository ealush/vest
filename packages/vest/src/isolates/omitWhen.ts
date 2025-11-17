import type { CB } from 'vest-utils';
import { dynamicValue } from 'vest-utils';

import { LazyDraft } from '../suiteResult/selectors/LazyDraft';
import { SuiteContext, useOmitted } from '../core/context/SuiteContext';
import { TFieldName, TGroupName } from '../suiteResult/SuiteResultTypes';
import {
  createVestIsolate,
  VestIsolateType,
} from '../core/isolate/VestIsolateType';
import { TDraftCondition } from '../suite/getTypedMethods';

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
  callback: CB,
): void {
  createVestIsolate(
    VestIsolateType.OmitWhen,
    () => {
      SuiteContext.run(
        {
          omitted:
            useWithinActiveOmitWhen() ||
            dynamicValue(conditional, LazyDraft<F, G>()),
        },
        callback,
      );
    },
    {
      tests: [],
    },
  );
}

// Checks that we're currently in an active omitWhen block
export function useWithinActiveOmitWhen(): boolean {
  return useOmitted();
}
