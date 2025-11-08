import { enforce } from 'n4s-schema';
import isURL from 'validator/es/lib/isURL';

enforce.extend({ isURL });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface EnforceMatchers {
      isURL: typeof isURL;
    }
  }
}
