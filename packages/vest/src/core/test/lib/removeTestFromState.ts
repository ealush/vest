import asArray from 'asArray';
import removeElementFromArray from 'removeElementFromArray';

import VestTest from 'VestTest';
import { useTestsOrdered } from 'stateHooks';

/**
 * Removes test object from suite state
 */
export default function (testObject: VestTest): void {
  const [, setTestObjects] = useTestsOrdered();
  setTestObjects(testObjects =>
    // using asArray to clear the cache.
    asArray(removeElementFromArray(testObjects, testObject))
  );
}
