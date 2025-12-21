import type { CB } from 'vest-utils';
import { dynamicValue } from 'vest-utils';
import { TIsolate } from 'vestjs-runtime';

import { SuiteContext, useOmitted } from '../core/context/SuiteContext';
import {
  createVestIsolate,
  VestIsolateType,
} from '../core/isolate/VestIsolateType';
import { TDraftCondition } from '../suite/getTypedMethods';
import { TFieldName, TGroupName } from '../suiteResult/SuiteResultTypes';
import { LazyDraft } from '../suiteResult/selectors/LazyDraft';

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
): TIsolate {
  return createVestIsolate(
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
    {},
  );
}

// Checks that we're currently in an active omitWhen block
export function useWithinActiveOmitWhen(): boolean {
  return useOmitted();
}
