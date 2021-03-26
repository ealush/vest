export default function createRef(state, { suiteId, name }) {
  return {
    pending: state.registerHandler(() => ({
      pending: [],
      lagging: [],
    })),
    suiteId: state.registerHandler(() => ({ id: suiteId, name })),
    testCallbacks: state.registerHandler(() => ({
      fieldCallbacks: [],
      doneCallbacks: [],
    })),
    testObjects: state.registerHandler(() => []),
    current: state.current, // TODO: remove this!
  };
}
