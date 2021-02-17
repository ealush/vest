import hasOwnProperty from 'hasOwnProperty';

import asArray from 'asArray';
import callEach from 'callEach';
import context from 'ctx';
import isFunction from 'isFunction';
import optionalFunctionValue from 'optionalFunctionValue';

export default (function createState() {
  function registerHandler(initialValue) {
    let key;
    function use(patcher) {
      const { stateRef, reg } = context.use();

      // Register state handler
      if (reg) {
        key = reg.key;
        if (!hasOwnProperty(stateRef.current(), key)) {
          stateRef.set(key, optionalFunctionValue(initialValue, reg.args));
        }
        return;
      }

      if (isFunction(patcher)) {
        update(patcher);
      }

      function update(patcher) {
        const { stateRef } = context.use();
        const currentState = stateRef.current();

        stateRef.set(key, optionalFunctionValue(patcher, [currentState[key]]));
      }

      return [stateRef.current()[key], update];
    }

    return use;
  }

  function createRef(handlers, onStateChange) {
    let state = {};
    const registeredHandlers = [];

    function current() {
      return state;
    }

    function set(key, value) {
      state[key] = value;

      if (isFunction(onStateChange)) {
        onStateChange(state, key, value);
      }
    }

    function reset() {
      state = {};
      callEach(registeredHandlers);
    }

    const stateRef = {
      current,
      reset,
      set,
    };

    if (handlers) {
      for (const key in handlers) {
        const [handler, args] = asArray(handlers[key]);
        registeredHandlers.push(
          context.bind({ stateRef, reg: { key, args } }, handler)
        );
      }
    }

    context.run({ stateRef }, reset);

    return stateRef;
  }

  return {
    registerHandler,
    createRef,
  };
})();
