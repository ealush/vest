import asArray from 'asArray';
import removeElementFromArray from 'removeElementFromArray';
import usePending from 'usePending';

/**
 * Sets a test as pending in the state.
 * @param {VestTest} testObject
 */
export const setPending = testObject => {
  const { fieldName, groupName, id } = testObject;

  const [pendingState, setPending] = usePending();

  const lagging = asArray(pendingState.lagging).reduce(
    (lagging, testObject) => {
      /**
       * If the test is of the same profile
       * (same name + same group) we cancel
       * it. Otherwise, it is lagging.
       */
      if (
        testObject.fieldName === fieldName &&
        testObject.groupName === groupName &&
        // This last case handles memoized tests
        // because that retain their od across runs
        testObject.id !== id
      ) {
        testObject.cancel();
      } else {
        lagging.push(testObject);
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
  usePending(state => ({
    pending: removeElementFromArray(state.pending, testObject),
    lagging: removeElementFromArray(state.lagging, testObject),
  }));
};
