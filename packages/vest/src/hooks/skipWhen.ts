import optionalFunctionValue from 'optionalFunctionValue';

import ctx from 'ctx';

export default function skipWhen(
  conditional: boolean | ((...args: any[]) => boolean),
  callback: (...args: any[]) => void
): void {
  ctx.run({ skipped: optionalFunctionValue(conditional) }, () => callback());
}
