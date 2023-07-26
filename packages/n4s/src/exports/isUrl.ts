import { enforce } from 'n4s';
import isUrl from 'validator/es/lib/isUrl';

import { EnforceCustomMatcher } from 'enforceUtilityTypes';

enforce.extend({ isUrl });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface EnforceCustomMatchers<R> {
      isUrl: EnforceCustomMatcher<typeof isUrl, R>;
    }
  }
}
