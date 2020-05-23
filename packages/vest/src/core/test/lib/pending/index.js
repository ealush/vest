import getSuiteState from '../../../state/getSuiteState';
import patch from '../../../state/patch';
import setCanceled from '../../../state/setCanceled';

/**
 * Sets a test as pending in the state.
 * @param {string} suiteId
 * @param {VestTest} testObject
 */
export const setPending = (suiteId, testObject) => {
  const fieldName = testObject.fieldName;

  const state = getSuiteState(suiteId);
  const { lagging, canceled } = state.lagging.reduce(
    ({ lagging, canceled }, testObject) => {
      if (testObject.fieldName !== fieldName) {
        lagging.push(testObject);
      } else {
        canceled.push(testObject);
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
