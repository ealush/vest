import { enforce } from 'n4s';
import isURL from 'validator/es/lib/isURL';

import { EnforceCustomMatcher } from 'enforceUtilityTypes';

enforce.extend({ isURL });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface EnforceCustomMatchers<R> {
      isURL: EnforceCustomMatcher<typeof isURL, R>;
    }
  }
}
