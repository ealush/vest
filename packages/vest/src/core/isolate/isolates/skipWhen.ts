import type { CB } from 'vest-utils';
import { optionalFunctionValue } from 'vest-utils';

import { IsolateTypes } from 'IsolateTypes';
import ctx from 'ctx';
import { isolate } from 'isolate';
import { produceSuiteResult, SuiteResult } from 'produceSuiteResult';

/**
 * Conditionally skips running tests within the callback.
 *
 * @example
 *
 * skipWhen(res => res.hasErrors('username'), () => {
 *  test('username', 'User already taken', async () => await doesUserExist(username)
 * });
 */
export default function skipWhen(
  conditional: boolean | ((draft: SuiteResult) => boolean),
  callback: CB
): void {
  isolate({ type: IsolateTypes.SKIP_WHEN }, () => {
    ctx.run(
      {
        skipped:
          // Checking for nested conditional. If we're in a nested skipWhen,
          // we should skip the test if the parent conditional is true.
          isExcludedIndividually() ||
          // Otherwise, we should skip the test if the conditional is true.
          optionalFunctionValue(
            conditional,
            optionalFunctionValue(produceSuiteResult)
          ),
      },
      () => callback()
    );
  });
}

export function isExcludedIndividually(): boolean {
  return !!ctx.useX().skipped;
}
