import asArray from 'asArray';
import removeElementFromArray from 'removeElementFromArray';

import VestTest from 'VestTest';
import isSameProfileTest from 'isSameProfileTest';
import { usePending, useLagging } from 'stateHooks';
/**
 * Sets a test as pending in the state.
 */
export function setPending(testObject: VestTest): void {
  const [lagging, setLagging] = useLagging();
  const [, setPending] = usePending();

  testObject.setPending();

  const nextLagging = asArray(lagging).reduce(
    (lagging: VestTest[], laggingTestObject) => {
      /**
       * If the test is of the same profile
       * (same name + same group) we cancel
       * it. Otherwise, it is lagging.
       */
      if (
        isSameProfileTest(testObject, laggingTestObject) &&
        // This last case handles memoized tests
        // because that retain their od across runs
        laggingTestObject.id !== testObject.id
      ) {
        laggingTestObject.cancel();
      } else {
        lagging.push(laggingTestObject);
      }

      return lagging;
    },
    []
  );

  setLagging(() => nextLagging);
  setPending(pending => pending.concat(testObject));
}

/**
 * Removes a tests from the pending and lagging arrays.
 */
export function removePending(testObject: VestTest): void {
  const [, setPending] = usePending();
  const [, setLagging] = useLagging();
  setPending(setPending => removeElementFromArray(setPending, testObject));
  setLagging(lagging => removeElementFromArray(lagging, testObject));
}
