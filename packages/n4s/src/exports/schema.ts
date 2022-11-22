import { enforce } from 'n4s';

import { EnforceCustomMatcher } from 'enforceUtilityTypes';
import { isArrayOf } from 'isArrayOf';
import { loose } from 'loose';
import { optional } from 'optional';
import { shape } from 'shape';

export { partial } from 'partial';

enforce.extend({ isArrayOf, loose, optional, shape });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface EnforceCustomMatchers<R> {
      isArrayOf: EnforceCustomMatcher<typeof isArrayOf, R>;
      loose: EnforceCustomMatcher<typeof loose, R>;
      shape: EnforceCustomMatcher<typeof shape, R>;
      optional: EnforceCustomMatcher<typeof optional, R>;
    }
  }
}
