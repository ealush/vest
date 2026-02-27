/**
 * Module: `src/exports/isURL.ts`.
 *
 * Provides `isURL`-related runtime and type utilities used by `n4s`.
 */
import isURL from 'validator/es/lib/isURL';

import { enforce } from '../n4s';

enforce.extend({ isURL });

declare global {
  namespace n4s {
    interface EnforceMatchers {
      isURL: typeof isURL;
    }
  }
}
