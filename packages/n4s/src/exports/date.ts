import isAfter from 'validator/es/lib/isAfter';
import isBefore from 'validator/es/lib/isBefore';
import isDate from 'validator/es/lib/isDate';
import isISO8601 from 'validator/es/lib/isISO8601';

import { enforce } from '../n4s';

enforce.extend({ isAfter, isBefore, isDate, isISO8601 });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface EnforceMatchers {
      isAfter: typeof isAfter;
      isBefore: typeof isBefore;
      isDate: typeof isDate;
      isISO8601: typeof isISO8601;
    }
  }
}
