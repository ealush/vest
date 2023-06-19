import { enforce } from 'n4s';
import isAfter from 'validator/es/lib/isAfter';
import isBefore from 'validator/es/lib/isBefore';
import isDate from 'validator/es/lib/isDate';
import isISO8601 from 'validator/es/lib/isISO8601';

import { EnforceCustomMatcher } from 'enforceUtilityTypes';

enforce.extend({ isAfter, isBefore, isDate, isISO8601 });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface EnforceCustomMatchers<R> {
      isAfter: EnforceCustomMatcher<typeof isAfter, R>;
      isBefore: EnforceCustomMatcher<typeof isBefore, R>;
      isDate: EnforceCustomMatcher<typeof isDate, R>;
      isISO8601: EnforceCustomMatcher<typeof isISO8601, R>;
    }
  }
}
