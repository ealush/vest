import isEmail from 'validator/es/lib/isEmail';

import { enforce } from 'n4s-schema';

enforce.extend({ isEmail });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface EnforceMatchers {
      isEmail: typeof isEmail;
    }
  }
}
