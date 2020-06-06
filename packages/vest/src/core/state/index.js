import singleton from '../../lib/singleton';
import { KEY_STATE, KEY_CANCELED, KEY_SUITES } from './constants';
/**
 * Registers a new state on Vest's singleton.
 */
const register = () => {
  singleton.set(
    KEY_STATE,
    singleton.use(KEY_STATE) ?? {
      [KEY_SUITES]: {},
      [KEY_CANCELED]: {},
    }
  );
};

/**
 * Retrieves the state object or a portion of it.
 * @param {string} [key] state portion to retrieve.
 */
export const getState = key =>
  key ? singleton.use(KEY_STATE)[key] : singleton.use(KEY_STATE);

/**
 * Updates the state with the value return from the setter callback.
 * @param {Function} setter setter function.
 * @returns {Object} updated state.
 */
export const setState = setter => {
  singleton.set(KEY_STATE, setter(getState()));

  return getState();
};

/**
 * @returns {Object} all the suites in the state.
 */
export const getSuites = () => getState(KEY_SUITES);

/**
 * Updates the state with the output of the setter callback.
 * @param {Function} setter
 * @returns {Object} all the suites in the state.
 */
export const setSuites = setter => {
  setState(state => {
    state[KEY_SUITES] = setter(state[KEY_SUITES]);
    return state;
  });
  return getSuites();
};

/**
 * @param {string} suiteId.
 * @returns {Object} Suite from state.
 */
export const getSuite = suiteId => getSuites()[suiteId];

export default {
  register,
};
