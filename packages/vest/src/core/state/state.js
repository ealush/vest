import callEach from 'callEach';
import context from 'ctx';
import isFunction from 'isFunction';

export default (function createState() {
  function registerHandler(initialValue) {
    let key;
    function use(patcher) {
      const { stateRef, reg } = context.use();

      // Register state handler
      if (reg) {
        key = reg.key;
        if (!stateRef.current().hasOwnProperty(key)) {
          stateRef.set(
            key,
            isFunction(initialValue)
              ? initialValue.apply(null, reg.args)
              : initialValue
          );
        }
        return;
      }

      if (isFunction(patcher)) {
        update(patcher);
      }

      function update(patcher) {
        const { stateRef } = context.use();
        const currentState = stateRef.current();

        stateRef.set(
          key,
          isFunction(patcher) ? patcher(currentState[key]) : patcher
        );
      }

      return [stateRef.current()[key], update];
    }

    return use;
  }

  function createRef(handlers = {}) {
    let state = {};
    const registeredHandlers = [];

    function current() {
      return state;
    }

    function set(key, value) {
      Object.assign(state, { [key]: value });
    }

    function reset() {
      state.length = 0;

      state = {};
      callEach(registeredHandlers);
    }

    const stateRef = {
      current,
      reset,
      set,
    };

    for (const key in handlers) {
      const [handler, args] = [].concat(handlers[key]);
      registeredHandlers.push(
        context.bind({ stateRef, reg: { key, args } }, handler)
      );
    }

    context.run({ stateRef }, reset);

    return stateRef;
  }

  return {
    registerHandler,
    createRef,
  };
})();
