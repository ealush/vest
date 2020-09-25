import createStore from '../../lib/createStorage';
import { KEY_CANCELED, KEY_SUITES } from './constants';

export const { get, set, register } = createStore(() => ({
  [KEY_SUITES]: {},
  [KEY_CANCELED]: {},
}));

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
