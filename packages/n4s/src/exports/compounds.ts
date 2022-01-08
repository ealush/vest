import { DropFirst } from 'utilityTypes';

import { allOf } from 'allOf';
import { anyOf } from 'anyOf';
import { enforce } from 'n4s';
import { noneOf } from 'noneOf';
import { oneOf } from 'oneOf';

enforce.extend({ allOf, anyOf, noneOf, oneOf });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface EnforceCustomMatchers<R> {
      allOf: (...args: DropFirst<Parameters<typeof allOf>>) => R;
      anyOf: (...args: DropFirst<Parameters<typeof anyOf>>) => R;
      noneOf: (...args: DropFirst<Parameters<typeof noneOf>>) => R;
      oneOf: (...args: DropFirst<Parameters<typeof oneOf>>) => R;
    }
  }
}
