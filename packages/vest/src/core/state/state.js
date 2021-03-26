import optionalFunctionValue from 'optionalFunctionValue';

export default function createState() {
  const state = {
    references: [],
  };

  const handlers = [];

  return {
    current,
    registerHandler,
    reset,
    set,
  };

  function registerHandler(initialValue) {
    handlers.push(initialValue);
    const length = current().push(optionalFunctionValue(initialValue));
    const key = length - 1;

    return function useStateKey() {
      return [
        current()[key],
        nextValue =>
          set(key, optionalFunctionValue(nextValue, [current()[key]])),
      ];
    };
  }

  function current() {
    return state.references;
  }

  function set(key, value) {
    state.references[key] = value;
  }

  function reset() {
    state.references = [];
    handlers.forEach(handler => registerHandler(handler));
  }
}
