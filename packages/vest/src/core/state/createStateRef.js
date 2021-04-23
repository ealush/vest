export default function createStateRef(state, { suiteId, name }) {
  return {
    pending: state.registerStateKey(() => ({
      pending: [],
      lagging: [],
    })),
    skippedTests: state.registerStateKey(() => []),
    suiteId: state.registerStateKey(() => ({ id: suiteId, name })),
    testCallbacks: state.registerStateKey(() => ({
      fieldCallbacks: {},
      doneCallbacks: [],
    })),
    testObjects: state.registerStateKey(() => []),
  };
}
