import optionalFunctionValue from 'optionalFunctionValue';

import { IsolateTypes } from 'IsolateTypes';
import ctx from 'ctx';
import { isolate } from 'isolate';
import { produceDraft, TDraftResult } from 'produceDraft';

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
  conditional: boolean | ((draft: TDraftResult) => boolean),
  callback: (...args: any[]) => void
): void {
  isolate({ type: IsolateTypes.OMIT_WHEN }, () => {
    ctx.run(
      {
        omitted:
          isOmitted() ||
          optionalFunctionValue(
            conditional,
            optionalFunctionValue(produceDraft)
          ),
      },
      () => callback()
    );
  });
}

export function isOmitted(): boolean {
  return !!ctx.useX().omitted;
}
