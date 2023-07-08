import { IsolateSelectors, type Isolate } from 'vestjs-runtime';

import { VestIsolateType } from 'VestIsolateType';
import type { IsolateFocused } from 'focused';

export function isIsolateFocused(isolate: Isolate): isolate is IsolateFocused {
  return IsolateSelectors.isIsolateType<IsolateFocused>(
    isolate,
    VestIsolateType.Focused
  );
}
