import type { CB } from 'vest-utils';
import { dynamicValue } from 'vest-utils';
import { TIsolate } from 'vestjs-runtime';

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
 * When the condition is met, the tests within the callback will be omitted
 * and will not be executed. The callback itself will also be skipped.
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
      const isOmitted = dynamicValue(conditional, LazyDraft<F, G>());

      if (!isOmitted) {
        callback();
      }
    },
    {
      tests: [],
    },
  );
}
