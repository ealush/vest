import { CB } from 'utilityTypes';
import { optionalFunctionValue } from 'vest-utils';

import { IsolateTypes } from 'IsolateTypes';
import ctx from 'ctx';
import { isolate } from 'isolate';
import { produceSuiteResult, SuiteResult } from 'produceSuiteResult';

/**
 * Conditionally omits tests from the suite.
 *
 * @example
 *
 * omitWhen(res => res.hasErrors('username'), () => {
 *  test('username', 'User already taken', async () => await doesUserExist(username)
 * });
 */
export default function omitWhen(
  conditional: boolean | ((draft: SuiteResult) => boolean),
  callback: CB
): void {
  isolate({ type: IsolateTypes.OMIT_WHEN }, () => {
    ctx.run(
      {
        omitted:
          isOmitted() ||
          optionalFunctionValue(
            conditional,
            optionalFunctionValue(produceSuiteResult)
          ),
      },
      () => callback()
    );
  });
}

export function isOmitted(): boolean {
  return !!ctx.useX().omitted;
}
