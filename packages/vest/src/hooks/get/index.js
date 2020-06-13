import produce from '../../core/produce';
import getSuiteState from '../../core/state/getSuiteState';
import throwError from '../../lib/throwError';

/**
 * @param {String} suiteId Suite id to find
 * @returns {Object} Up to date state copy.
 */
const get = suiteId => {
  if (!suiteId) {
    throwError('`get` hook was called without a suite name.');
  }

  const state = getSuiteState(suiteId);
  return produce(state, { draft: true });
};

export default get;
