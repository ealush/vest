import type { Isolate } from 'vestjs-runtime';

import { VestIsolateType } from 'VestIsolateType';
import type { IsolateFocused } from 'focused';

export function isIsolateFocused(isolate: Isolate): isolate is IsolateFocused {
  return isolate.type === VestIsolateType.Focused;
}
