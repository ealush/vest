import go from '../globalObject';
import throwError from '../throwError';
import { SYMBOL_VEST } from './symbols';
/**
 * Throws an error when multiple versions of Vest are detected on the same runtime.
 * @param  {String[]} versions List of detected Vest versions.
 */
const throwMultipleVestError = (...versions) => {
  throwError(`Multiple versions of Vest detected: (${versions.join()}).
    Most features should work regularly, but for optimal feature compatibility, you should have all running instances use the same version.`);
};

/**
 * Registers current Vest instance on global object.
 * @param {Object} vest Reference to Vest.
 * @return {Function} Global Vest reference.
 */
const register = (vest, cb) => {
  const existing = go[SYMBOL_VEST];

  if (existing) {
    if (existing.VERSION !== vest.VERSION) {
      throwMultipleVestError(vest.VERSION, existing.VERSION);
    }
  } else {
    go[SYMBOL_VEST] = vest;
  }

  cb();

  return go[SYMBOL_VEST];
};

/**
 * @returns Global Vest instance or a portion of it.
 */
const use = key => (key ? go[SYMBOL_VEST][key] : go[SYMBOL_VEST]);

/**
 * Updates a key in the state.
 * @param {string} key
 * @param {*} value
 */
const set = (key, value) => (go[SYMBOL_VEST][key] = value);

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
