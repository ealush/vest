import { CB } from 'vest-utils';

import { PersistedContext } from 'PersistedContext';
import { SuiteContext } from 'SuiteContext';

export function persistEssential<T extends CB>(cb: T): T {
  return PersistedContext.bind(
    { ...PersistedContext.useX() },
    SuiteContext.bind({ ...SuiteContext.useX() }, cb)
  );
}
