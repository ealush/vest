import * as state from '../../state';
import { KEY_SUITES } from '../../state/constants';

/**
 * Updates the state with the output of the setter callback.
 * @param {Function} setter
 * @returns {Object} all the suites in the state.
 */
const setSuites = setter => {
  state.set(state => {
    state[KEY_SUITES] = setter(state[KEY_SUITES]);
    return state;
  });
  return state.get()[KEY_SUITES];
};

export default setSuites;
