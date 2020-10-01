import removeElementFromArray from '../../../../lib/removeElementFromArray';
import context from '../../../context';

/**
 * Sets a test as pending in the state.
 * @param {VestTest} testObject
 */
export const setPending = testObject => {
  const { fieldName, groupName } = testObject;
  const { stateRef } = context.use();
  const state = stateRef.current();
  const { lagging, canceled } = state.lagging.reduce(
    ({ lagging, canceled }, testObject) => {
      /**
       * If the test is of the same profile
       * (same name + same group) we cancel
       * it. Otherwise, it is lagging.
       */
      if (
        testObject.fieldName === fieldName &&
        testObject.groupName === groupName
      ) {
        canceled.push(testObject);
      } else {
        lagging.push(testObject);
      }

      return { lagging, canceled };
    },
    { lagging: [], canceled: [] }
  );

  stateRef.patch(state => ({
    ...state,
    lagging,
    pending: state.pending.concat(testObject),
  }));
  stateRef.setCanceled(...canceled);
};

/**
 * Removes a tests from the pending and lagging arrays.
 * @param {VestTest} testObject
 */
export const removePending = testObject => {
  const { stateRef } = context.use();

  stateRef.patch(state => ({
    ...state,
    pending: removeElementFromArray(state.pending, testObject),
    lagging: removeElementFromArray(state.lagging, testObject),
  }));
};
