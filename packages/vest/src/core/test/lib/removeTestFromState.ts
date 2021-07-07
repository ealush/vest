import asArray from 'asArray';
import removeElementFromArray from 'removeElementFromArray';

import VestTest from 'VestTest';
import { useTestObjects } from 'stateHooks';

/**
 * Removes test object from suite state
 */
export default function (testObject: VestTest): void {
  const [, setTestObjects] = useTestObjects();
  setTestObjects(testObjects =>
    // using asArray to clear the cache.
    asArray(removeElementFromArray(testObjects, testObject))
  );
}
