import removeElementFromArray from '../../../../lib/removeElementFromArray';
import usePending from './usePending';

/**
 * Sets a test as pending in the state.
 * @param {VestTest} testObject
 */
export const setPending = testObject => {
  const { fieldName, groupName } = testObject;

  const [pendingState, setPending] = usePending();

  const lagging = pendingState.lagging.reduce((lagging, testObject) => {
    /**
     * If the test is of the same profile
     * (same name + same group) we cancel
     * it. Otherwise, it is lagging.
     */
    if (
      testObject.fieldName === fieldName &&
      testObject.groupName === groupName
    ) {
      testObject.cancel();
    } else {
      lagging.push(testObject);
    }

    return lagging;
  }, []);

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
