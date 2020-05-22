import singleton from '../../lib/singleton';
import { SYMBOL_STATE, SYMBOL_CANCELED, SYMBOL_SUITES } from './symbols';
/**
 * Registers a new state on Vest's singleton.
 */
const register = () => {
  singleton.set(
    SYMBOL_STATE,
    singleton.use(SYMBOL_STATE) ?? {
      [SYMBOL_SUITES]: {},
      [SYMBOL_CANCELED]: {},
    }
  );
};

/**
 * Retrieves the state object or a portion of it.
 * @param {string} [key] state portion to retrieve.
 */
export const getState = key =>
  key ? singleton.use(SYMBOL_STATE)[key] : singleton.use(SYMBOL_STATE);

/**
 * Updates the state with the value return from the setter callback.
 * @param {Function} setter setter function.
 * @returns {Object} updated state.
 */
export const setState = setter => {
  singleton.set(SYMBOL_STATE, setter(getState()));

  return getState();
};

/**
 * @returns {Object} all the suites in the state.
 */
export const getSuites = () => getState(SYMBOL_SUITES);

/**
 * Updates the state with the output of the setter callback.
 * @param {Function} setter
 * @returns {Object} all the suites in the state.
 */
export const setSuites = setter => {
  setState(state => {
    state[SYMBOL_SUITES] = setter(state[SYMBOL_SUITES]);
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
