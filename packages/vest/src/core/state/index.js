import { KEY_CANCELED, KEY_SUITES } from './constants';

export const { get, set, register } = (() => {
  const storage = {
    state: {
      [KEY_SUITES]: {},
      [KEY_CANCELED]: {},
    },
  };

  /**
   * Retrieves the state object or a portion of it.
   */
  const get = () => storage.state;

  /**
   * Updates the state with the value return from the setter callback.
   * @param {Function} setter setter function.
   * @returns {Object} updated state.
   */
  const set = setter => {
    storage.state = setter(get());

    return get();
  };

  const register = () =>
    set(
      state =>
        state ?? {
          [KEY_SUITES]: {},
          [KEY_CANCELED]: {},
        }
    );

  register();

  return { get, set, register };
})();

/**
 * Updates the state with the output of the setter callback.
 * @param {Function} setter
 * @returns {Object} all the suites in the state.
 */
export const setSuites = setter => {
  set(state => {
    state[KEY_SUITES] = setter(state[KEY_SUITES]);
    return state;
  });
  return get()[KEY_SUITES];
};

/**
 * @param {string} suiteId.
 * @returns {Object} Suite from state.
 */
export const getSuite = suiteId => get()[KEY_SUITES][suiteId];
