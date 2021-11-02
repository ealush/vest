import optionalFunctionValue from 'optionalFunctionValue';

import { IsolateTypes } from 'IsolateTypes';
import ctx from 'ctx';
import { isolate } from 'isolate';
import { produceDraft, TDraftResult } from 'produceDraft';

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
