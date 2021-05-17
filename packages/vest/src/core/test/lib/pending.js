import asArray from 'asArray';
import isSameProfileTest from 'isSameProfileTest';
import removeElementFromArray from 'removeElementFromArray';
import { usePending } from 'stateHooks';
/**
 * Sets a test as pending in the state.
 * @param {VestTest} testObject
 */
export const setPending = testObject => {
  const [pendingState, setPending] = usePending();

  const lagging = asArray(pendingState.lagging).reduce(
    (lagging, laggingTestObject) => {
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

  setPending(state => ({
    lagging,
    pending: state.pending.concat(testObject),
  }));
};

/**
 * Removes a tests from the pending and lagging arrays.
 * @param {VestTest} testObject
 */
export const removePending = testObject => {
  const [, setPending] = usePending();
  setPending(state => ({
    pending: removeElementFromArray(state.pending, testObject),
    lagging: removeElementFromArray(state.lagging, testObject),
  }));
};
