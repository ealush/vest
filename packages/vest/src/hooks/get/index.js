import produce from '../../core/produce';
import getState from '../../core/suite/getState';
import throwError from '../../lib/throwError';

/**
 * @param {String} suiteId Suite id to find
 * @returns {Object} Up to date state copy.
 */
const get = suiteId => {
  if (!suiteId) {
    throwError('`get` hook was called without a suite name.');
  }

  const state = getState(suiteId);
  return produce(state, { draft: true });
};

export default get;
