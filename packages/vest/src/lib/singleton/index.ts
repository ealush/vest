import go from '../globalObject';
import throwError from '../throwError';
import { SYMBOL_VEST_GLOBAL } from './constants';
import type { ContextType } from '../../core/Context';

type VestGlobal = {
  VERSION: string;
};

/**
 * Throws an error when multiple versions of Vest are detected on the same runtime.
 */
const throwMultipleVestError = (...versions: string[]) => {
  throwError(`Multiple versions of Vest detected: (${versions.join()}).
    Most features should work regularly, but for optimal feature compatibility, you should have all running instances use the same version.`);
};

/**
 * Registers current Vest instance on a global object.
 */
const register = (): VestGlobal => {
  // @ts-ignore
  const existing: VestGlobal = go[SYMBOL_VEST_GLOBAL];

  if (existing) {
    if (existing.VERSION !== VEST_VERSION) {
      throwMultipleVestError(VEST_VERSION, existing.VERSION);
    }
  } else {
    // @ts-ignore
    go[SYMBOL_VEST_GLOBAL] = { VERSION: VEST_VERSION };
  }

  // @ts-ignore
  return go[SYMBOL_VEST_GLOBAL];
};

/**
 * @returns Global Vest instance or a portion of it.
 */
// @ts-ignore
const use = (key?: string) =>
  // @ts-ignore
  key ? go[SYMBOL_VEST_GLOBAL][key] : go[SYMBOL_VEST_GLOBAL];

/**
 * Updates a key in the state.
 */
// @ts-ignore
const set = (key: string, value: any) => (go[SYMBOL_VEST_GLOBAL][key] = value);

/**
 * @returns Current Vest context.
 */
const useContext = (): ContextType => use().ctx;

export default {
  register,
  set,
  use,
  useContext,
};
