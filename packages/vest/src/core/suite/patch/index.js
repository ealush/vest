import { getSuite } from '..';

/**
 * Updates current suite state with patcher value or output.
 * @param {string} suiteId.
 * @param {Function} patcher Uses to determine next value.
 * @return {Object} Next suite state.
 */
const patch = (suiteId, patcher) => {
  const [state, prevState] = getSuite(suiteId) ?? [];

  const nextState = patcher(state, prevState);

  if (nextState === state) {
    return state;
  }

  getSuite(suiteId)[0] = nextState;
  return nextState;
};

export default patch;
