import optionalFunctionValue from 'optionalFunctionValue';

import { IsolateTypes } from 'IsolateTypes';
import ctx from 'ctx';
import { isolate } from 'isolate';

export default function skipWhen(
  conditional: boolean | ((...args: any[]) => boolean),
  callback: (...args: any[]) => void
): void {
  isolate({ type: IsolateTypes.SKIP_WHEN }, () => {
    ctx.run({ skipped: optionalFunctionValue(conditional) }, () => callback());
  });
}
