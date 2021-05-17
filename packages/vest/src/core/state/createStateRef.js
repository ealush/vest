export default function createStateRef(state, { suiteId, name }) {
  return {
    carryOverTests: state.registerStateKey(() => []),
    optionalFields: state.registerStateKey(() => ({})),
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
