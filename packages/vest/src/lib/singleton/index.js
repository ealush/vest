import go from '../globalObject';
import throwError from '../throwError';
import { SYMBOL_VEST_GLOBAL } from './constants';
/**
 * Throws an error when multiple versions of Vest are detected on the same runtime.
 * @param  {String[]} versions List of detected Vest versions.
 */
const throwMultipleVestError = (...versions) => {
  throwError(`Multiple versions of Vest detected: (${versions.join()}).
    Most features should work regularly, but for optimal feature compatibility, you should have all running instances use the same version.`);
};

/**
 * Registers current Vest instance on a global object.
 */
const register = () => {
  const existing = go[SYMBOL_VEST_GLOBAL];

  if (existing) {
    if (existing.VERSION !== VEST_VERSION) {
      throwMultipleVestError(VEST_VERSION, existing.VERSION);
    }
  } else {
    go[SYMBOL_VEST_GLOBAL] = { VERSION: VEST_VERSION };
  }

  return go[SYMBOL_VEST_GLOBAL];
};

/**
 * @returns Global Vest instance or a portion of it.
 */
const use = key => (key ? go[SYMBOL_VEST_GLOBAL][key] : go[SYMBOL_VEST_GLOBAL]);

/**
 * Updates a key in the state.
 * @param {string} key
 * @param {*} value
 */
const set = (key, value) => (go[SYMBOL_VEST_GLOBAL][key] = value);

/**
 * @returns Current Vest context.
 */
const useContext = () => use().ctx;

export default {
  register,
  set,
  use,
  useContext,
};
