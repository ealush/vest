import optionalFunctionValue from 'optionalFunctionValue';

import { IsolateTypes } from 'IsolateTypes';
import ctx from 'ctx';
import { isolate } from 'isolate';
import { produceDraft, TDraftResult } from 'produceDraft';

export default function omitWhen(
  conditional: boolean | ((draft: TDraftResult) => boolean),
  callback: (...args: any[]) => void
): void {
  isolate({ type: IsolateTypes.OMIT_WHEN }, () => {
    ctx.run(
      {
        omitted: optionalFunctionValue(
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
