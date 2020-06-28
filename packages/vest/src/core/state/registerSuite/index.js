import { getSuite, setSuites } from '..';
import {
  EXCLUSION_ITEM_TYPE_TESTS,
  EXCLUSION_ITEM_TYPE_GROUPS,
} from '../../../hooks/exclusive/constants';
import singleton from '../../../lib/singleton';

/**
 * Generates a default suite state object.
 * @param {string} suiteId  Unique identifier of the validation suite.
 * @param {string} name     Name of the validation suite.
 */
const INITIAL_SUITE_STATE = (suiteId, name) => ({
  doneCallbacks: [],
  exclusion: {
    [EXCLUSION_ITEM_TYPE_TESTS]: {},
    [EXCLUSION_ITEM_TYPE_GROUPS]: {},
  },
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
const registerSuite = () => {
  const context = singleton.useContext();
  const { name, suiteId } = context;
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

export default registerSuite;
