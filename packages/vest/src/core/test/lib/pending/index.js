import getSuiteState from '../../../state/getSuiteState';
import patch from '../../../state/patch';
import { setCanceled } from '../canceled';

/**
 * Sets a test as pending in the state.
 * @param {string} suiteId
 * @param {VestTest} testObject
 */
export const setPending = (suiteId, testObject) => {
  const { fieldName, groupName } = testObject;
  const state = getSuiteState(suiteId);
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

  patch(suiteId, state => ({
    ...state,
    lagging,
    pending: state.pending.concat(testObject),
  }));
  setCanceled(...canceled);
};

/**
 * Removes a tests from the pending and lagging arrays.
 * @param {VestTest} testObject
 */
export const removePending = testObject => {
  patch(testObject.suiteId, state => ({
    ...state,
    pending: state.pending.filter(tO => tO !== testObject),
    lagging: state.lagging.filter(tO => tO !== testObject),
  }));
};
