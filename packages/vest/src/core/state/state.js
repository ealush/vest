import isFunction from 'isFunction';
import optionalFunctionValue from 'optionalFunctionValue';

export default function createState(onStateChange) {
  const state = {
    references: [],
  };

  const initializers = [];

  return {
    registerStateKey,
    reset,
  };

  function registerStateKey(initialValue) {
    const key = initializers.length;
    initializers.push(initialValue);
    return initKey(key, initialValue);
  }

  function initKey(key, value) {
    current().push(optionalFunctionValue(value));

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

  function reset() {
    state.references = [];
    initializers.forEach((value, index) => initKey(index, value));
  }

  function set(key, value) {
    state.references[key] = value;

    if (isFunction(onStateChange)) {
      onStateChange();
    }
  }
}
