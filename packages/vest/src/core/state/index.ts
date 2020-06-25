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
 */
export const getState = (): StateInterface => singleton.use(KEY_STATE);

export const getStateKey = <T extends keyof StateInterface>(
  key: T
): StateInterface[T] => getState()[key];

/**
 * Updates the state with the value return from the setter callback.
 */
export const setState = (
  setter: (state: StateInterface) => StateInterface
): StateInterface => {
  singleton.set(KEY_STATE, setter(getState()));

  return getState();
};

export const getSuites = (): StateKeySuites => getStateKey(KEY_SUITES);

/**
 * Updates the state with the output of the setter callback.
 */
export const setSuites = (
  setter: (suites: StateKeySuites) => StateKeySuites
): StateKeySuites => {
  setState(state => {
    state[KEY_SUITES] = setter(state[KEY_SUITES]);
    return state;
  });
  return getSuites();
};

export const getSuite = (suiteId: string): SuiteStateHistory =>
  getSuites()[suiteId];

export default {
  register,
};
