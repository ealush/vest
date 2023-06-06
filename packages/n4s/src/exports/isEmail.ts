import { enforce } from 'n4s';
import isEmail from 'validator/es/lib/isEmail';

import { EnforceCustomMatcher } from 'enforceUtilityTypes';

enforce.extend({ isEmail });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface EnforceCustomMatchers<R> {
      isEmail: EnforceCustomMatcher<typeof isEmail, R>;
    }
  }
}
