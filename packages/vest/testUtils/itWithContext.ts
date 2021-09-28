import optionalFunctionValue from 'optionalFunctionValue';

import runCreateRef from './runCreateRef';

import context from 'ctx';
import { initBus } from 'vestBus';

export default function itWithContext(
  str: string,
  cb: () => void,
  getCTX?: () => Record<string, any>
): void {
  return it(str, () =>
    context.run(
      optionalFunctionValue(getCTX) ?? {
        stateRef: runCreateRef(),
        bus: initBus(),
      },
      cb
    )
  );
}
