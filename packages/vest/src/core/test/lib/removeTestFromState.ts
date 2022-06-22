import { nestedArray } from 'vest-utils';

import VestTest from 'VestTest';
import { useSetTests } from 'stateHooks';

/**
 * Removes test object from suite state
 */
export default function (testObject: VestTest): void {
  useSetTests(tests =>
    nestedArray.transform(tests, test => (testObject !== test ? test : null))
  );
}
