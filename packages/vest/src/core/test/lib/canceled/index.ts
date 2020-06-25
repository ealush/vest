import { setState } from '../../../state';
import { KEY_CANCELED } from '../../../state/constants';
import type { VestTestType } from '../VestTest';
/**
 * Adds a VestTest to the canceled state.
 */
export const setCanceled = (...testObjects: VestTestType[]) => {
  if (!testObjects || !testObjects.length) {
    return;
  }

  setState(state => ({
    ...state,
    [KEY_CANCELED]: testObjects.reduce((ids, testObject: VestTestType) => {
      ids[testObject.id] = true;
      return ids;
    }, state[KEY_CANCELED]),
  }));
};

/**
 * Removes a test from canceled state.
 */
export const removeCanceled = (testObject: VestTestType) => {
  setState(state => {
    delete state[KEY_CANCELED][testObject.id];
    return state;
  });
};
