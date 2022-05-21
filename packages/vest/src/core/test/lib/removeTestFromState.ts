import * as nestedArray from 'nestedArray';

import VestTest from 'VestTest';
import { setIsolateRootTests } from 'isolateHooks';
import { useSetTests } from 'stateHooks';

/**
 * Removes test object from suite state
 */
export default function (testObject: VestTest): void {
  useSetTests(tests =>
    nestedArray.transform(tests, test => (testObject !== test ? test : null))
  );
  setIsolateRootTests(tests =>
    nestedArray.transform(tests, test => (testObject !== test ? test : null))
  );
}
