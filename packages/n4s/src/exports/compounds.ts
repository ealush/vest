import { enforce } from 'n4s';
import { DropFirst } from 'utilityTypes';

import { allOf } from 'allOf';
import { anyOf } from 'anyOf';
import { noneOf } from 'noneOf';
import { oneOf } from 'oneOf';
import { optional } from 'optional';

enforce.extend({ allOf, anyOf, noneOf, oneOf, optional });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface EnforceCustomMatchers<R> {
      allOf: (...args: DropFirst<Parameters<typeof allOf>>) => R;
      anyOf: (...args: DropFirst<Parameters<typeof anyOf>>) => R;
      noneOf: (...args: DropFirst<Parameters<typeof noneOf>>) => R;
      oneOf: (...args: DropFirst<Parameters<typeof oneOf>>) => R;
      optional: (...args: DropFirst<Parameters<typeof optional>>) => R;
    }
  }
}
