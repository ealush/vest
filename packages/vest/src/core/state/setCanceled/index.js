import { setState } from '..';
import { SYMBOL_CANCELED } from '../symbols';

/**
 * Adds a VestTest to the canceled state.
 * @param  {VestTest[]} testObjects
 */
const setCanceled = (...testObjects) => {
  if (!testObjects || !testObjects.length) {
    return;
  }

  setState(state => ({
    ...state,
    [SYMBOL_CANCELED]: testObjects.reduce(
      (ids, testObjects) => Object.assign(ids, { [testObjects.id]: true }),
      state[SYMBOL_CANCELED]
    ),
  }));
};

export default setCanceled;
