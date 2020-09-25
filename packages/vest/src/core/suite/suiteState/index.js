import { OPERATION_MODE_STATEFUL } from '../../../constants';
import throwError from '../../../lib/throwError';
import context from '../../context';
import state from '../../state';
import { KEY_SUITES } from '../../state/constants';
import { setCanceled } from '../../test/lib/canceled';

/**
 * Updates the state with the output of the setter callback.
 * @param {Function} setter
 * @returns {Object} all the suites in the state.
 */
export const setSuites = setter => {
  state.set(state => {
    state[KEY_SUITES] = setter(state[KEY_SUITES]);
    return state;
  });
  return state.get()[KEY_SUITES];
};

/**
 * @param {string} suiteId.
 * @returns {Object} Suite from state.
 */
export const getSuite = suiteId => state.get()[KEY_SUITES][suiteId];

/**
 * Retrieves most recent suite state.
 * @param {string} suiteId
 * @returns {Object} Current suite state.
 */
export const getState = suiteId => getSuite(suiteId)[0];

/**
 * Updates current suite state with patcher value or output.
 * @param {string} suiteId.
 * @param {Function} patcher Uses to determine next value.
 * @return {Object} Next suite state.
 */
export const patch = (suiteId, patcher) => {
  const [state, prevState] = getSuite(suiteId) ?? [];

  const nextState = patcher(state, prevState);

  if (nextState === state) {
    return state;
  }

  getSuite(suiteId)[0] = nextState;
  return nextState;
};

/**
 * Cleans up a suite from state.
 * @param {string} suiteId
 */
export const remove = suiteId => {
  if (!suiteId) {
    throwError('`vest.remove` must be called with suiteId.');
  }

  const suite = getState(suiteId);
  if (!suite) {
    return;
  }

  setCanceled(...(suite.pending || []));
  setCanceled(...(suite.lagging || []));

  setSuites(state => {
    delete state[suiteId];
    return state;
  });
};

/**
 * Resets suite to its initial state
 * @param {String} suiteId
 */
export const reset = suiteId => {
  if (!suiteId) {
    throwError('`vest.reset` must be called with suiteId.');
  }

  let name = suiteId;
  try {
    name = getState(suiteId).name;
    remove(suiteId);
  } catch {
    /* */
  }

  context.run(
    { name, suiteId, operationMode: OPERATION_MODE_STATEFUL },
    register
  );
};

/**
 * Generates a default suite state object.
 * @param {string} suiteId  Unique identifier of the validation suite.
 * @param {string} name     Name of the validation suite.
 */
const INITIAL_SUITE_STATE = (suiteId, name) => ({
  doneCallbacks: [],
  fieldCallbacks: {},
  groups: {},
  lagging: [],
  name,
  pending: [],
  suiteId,
  testObjects: [],
  tests: {},
});

/**
 * Registers a new suite run.
 */
export const register = () => {
  const ctx = context.use();
  const { name, suiteId = name } = ctx;

  let suite = getSuite(suiteId);

  let lagging = [];

  if (!suite) {
    suite = setSuites(suites => {
      suites[suiteId] = [];
      return suites;
    })[suiteId];
  } else {
    const [prevState] = suite;

    lagging = [...prevState.lagging, ...prevState.pending];

    prevState.pending = null;
    prevState.lagging = null;
  }

  const next = {
    ...INITIAL_SUITE_STATE(suiteId, name),
    lagging,
  };

  suite.unshift(next);
  suite.length = 2;
  setSuites(state => {
    state[suiteId] = suite;
    return state;
  });
};
