import optionalFunctionValue from 'optionalFunctionValue';

import { IsolateTypes } from 'IsolateTypes';
import ctx from 'ctx';
import { isolate } from 'isolate';
import { produceDraft, TDraftResult } from 'produceDraft';

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
  conditional: boolean | ((draft: TDraftResult) => boolean),
  callback: (...args: any[]) => void
): void {
  isolate({ type: IsolateTypes.SKIP_WHEN }, () => {
    ctx.run(
      {
        skipped: optionalFunctionValue(
          conditional,
          optionalFunctionValue(produceDraft)
        ),
      },
      () => callback()
    );
  });
}
