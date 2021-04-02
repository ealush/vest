export default function createStateRef(state, { suiteId, name }) {
  return {
    pending: state.registerStateKey(() => ({
      pending: [],
      lagging: [],
    })),
    suiteId: state.registerStateKey(() => ({ id: suiteId, name })),
    testCallbacks: state.registerStateKey(() => ({
      fieldCallbacks: [],
      doneCallbacks: [],
    })),
    testObjects: state.registerStateKey(() => []),
  };
}
