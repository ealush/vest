import { getSuite, setSuites } from '..';
import singleton from '../../../lib/singleton';

/**
 * Generates a default suite state object.
 * @param {string} suiteId  Unique identifier of the validation suite.
 * @param {string} name     Name of the validation suite.
 */
const INITIAL_SUITE_STATE = (suiteId, name) => ({
  name,
  suiteId,
  pending: [],
  lagging: [],
  skippedTests: {},
  skippedGroups: {},
  doneCallbacks: [],
  fieldCallbacks: {},
  tests: {},
  groups: {},
  exclusive: {},
  errorCount: 0,
  warnCount: 0,
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
  setSuites(state =>
    Object.assign(state, {
      [suiteId]: suite,
    })
  );
};

export default registerSuite;
