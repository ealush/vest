import { Isolate, isolateInterfaces } from 'vestjs-runtime';

import { VestIsolateType } from 'VestIsolateType';

export class IsolateEach
  extends Isolate
  implements isolateInterfaces.IReorderable
{
  type = VestIsolateType.Each;
  allowReorder = true as const;
}
