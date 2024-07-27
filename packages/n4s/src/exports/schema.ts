import { enforce } from 'n4s';

import { EnforceCustomMatcher } from '../lib/enforceUtilityTypes';
import { isArrayOf } from '../plugins/schema/isArrayOf';
import { loose } from '../plugins/schema/loose';
import { optional } from '../plugins/schema/optional';
import { shape } from '../plugins/schema/shape';

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
