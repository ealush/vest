import isAfter from 'validator/es/lib/isAfter';
import isBefore from 'validator/es/lib/isBefore';
import isDate from 'validator/es/lib/isDate';
import isISO8601 from 'validator/es/lib/isISO8601';

import { enforce } from '../n4s';
import type { WidenFirstParam } from '../n4sTypes';

enforce.extend({ isAfter, isBefore, isDate, isISO8601 });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface EnforceMatchers {
      isAfter: WidenFirstParam<typeof isAfter, string | Date | number>;
      isBefore: WidenFirstParam<typeof isBefore, string | Date | number>;
      isDate: WidenFirstParam<typeof isDate, string | Date | number>;
      isISO8601: WidenFirstParam<typeof isISO8601, string | Date | number>;
    }
  }
}
