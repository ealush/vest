import isEmail from 'validator/es/lib/isEmail';

import { enforce } from '../n4s';

enforce.extend({ isEmail });

declare global {
  namespace n4s {
    interface EnforceMatchers {
      isEmail: typeof isEmail;
    }
  }
}
