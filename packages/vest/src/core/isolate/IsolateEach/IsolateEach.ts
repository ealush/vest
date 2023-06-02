import { Isolate } from 'vestjs-runtime';

import { VestIsolateType } from 'VestIsolateType';

export class IsolateEach extends Isolate {
  type = VestIsolateType.Each;
  allowReorder = true;
}
