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
 * Unlike `skipWhen`, omitted tests are **completely removed** from the
 * result — they do not retain their previous state and are not counted
 * in `testCount`, `errorCount`, or validity checks. Use `omitWhen` when
 * the tests are irrelevant to the current form state (e.g., omit
 * "confirm password" tests when the password field is empty).
 *
 * @example
 *
 * // Don't validate confirmation when password is empty
 * omitWhen(!data.password, () => {
 *   test('confirm', 'Passwords do not match', () => {
 *     enforce(data.confirm).equals(data.password);
 *   });
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
