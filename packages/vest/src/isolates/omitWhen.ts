import type { CB } from 'vest-utils';
import { dynamicValue } from 'vest-utils';
import { Isolate } from 'vestjs-runtime';

import { LazyDraft } from 'LazyDraft';
import { SuiteContext, useOmitted } from 'SuiteContext';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestIsolateType } from 'VestIsolateType';
import { TDraftCondition } from 'getTypedMethods';

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
  Isolate.create(VestIsolateType.OmitWhen, () => {
    SuiteContext.run(
      {
        omitted:
          useWithinActiveOmitWhen() ||
          dynamicValue(conditional, LazyDraft<F, G>()),
      },
      callback,
    );
  });
}

// Checks that we're currently in an active omitWhen block
export function useWithinActiveOmitWhen(): boolean {
  return useOmitted();
}
