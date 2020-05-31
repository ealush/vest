import { setState } from '../../../state';
import { SYMBOL_CANCELED } from '../../../state/symbols';

/**
 * Adds a VestTest to the canceled state.
 * @param  {VestTest[]} testObjects
 */
export const setCanceled = (...testObjects) => {
  if (!testObjects || !testObjects.length) {
    return;
  }

  setState(state => ({
    ...state,
    [SYMBOL_CANCELED]: testObjects.reduce((ids, testObjects) => {
      ids[testObjects.id] = true;
      return ids;
    }, state[SYMBOL_CANCELED]),
  }));
};

/**
 * Removes a test from canceled state.
 * @param {VestTest} testObject
 */
export const removeCanceled = testObject => {
  setState(state => {
    delete state[SYMBOL_CANCELED][testObject.id];
    return state;
  });
};
