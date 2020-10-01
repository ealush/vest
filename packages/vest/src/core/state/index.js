import genId from '../../lib/id';

const initialSuiteState = (name, id) => ({
  doneCallbacks: [],
  fieldCallbacks: {},
  groups: {},
  id,
  lagging: [],
  name,
  pending: [],
  testObjects: [],
  tests: {},
});

const createState = name => {
  const suite = [];
  const canceled = {};

  const id = genId();

  const current = () => suite[0];
  const prev = () => suite[1];

  const registerValidation = () => {
    let lagging = [];

    const prevState = current();

    lagging = [...prevState.lagging, ...prevState.pending];
    prevState.pending = null;
    prevState.lagging = null;

    const next = Object.assign(initialSuiteState(name, id), lagging);

    suite.unshift(next);
    suite.length = 2;
  };

  const reset = () => {
    setCanceled(...(suite.pending ?? []));
    setCanceled(...(suite.lagging ?? []));

    suite.length = 0;
    suite.push(initialSuiteState(name, id));
  };

  const patch = patcher => {
    const [state, prevState] = suite;

    const nextState = patcher(state, prevState);

    if (nextState === state) {
      return state;
    }

    suite[0] = nextState;

    return nextState;
  };

  const getCanceled = () => canceled;

  const setCanceled = (...testObects) => {
    if (!testObects || !testObects.length) {
      return;
    }

    testObects.reduce(
      (canceled, { id }) => Object.assign(canceled, { [id]: true }),
      canceled
    );
  };

  const removeCanceled = ({ id }) => {
    // TODO: check if this is really needed
    delete canceled[id];
  };

  reset();

  return {
    current,
    getCanceled,
    patch,
    prev,
    registerValidation,
    removeCanceled,
    reset,
    setCanceled,
  };
};

export default createState;
