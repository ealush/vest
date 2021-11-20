import { DropFirst } from 'utilityTypes';

import { isArrayOf } from 'isArrayOf';
import { loose } from 'loose';
import { enforce } from 'n4s';
import { shape } from 'shape';

enforce.extend({ shape, loose, isArrayOf });

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface EnforceCustomMatchers<R> {
      isArrayOf: (...args: DropFirst<Parameters<typeof isArrayOf>>) => R;
      loose: (...args: DropFirst<Parameters<typeof loose>>) => R;
      shape: (...args: DropFirst<Parameters<typeof shape>>) => R;
    }
  }
}
