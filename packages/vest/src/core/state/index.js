import context from '../context';

const SYMBOL_ADD_TO_STATE = Symbol();

export default (function createState() {
  function registerHandler(initialValue) {
    let key;
    function use(patcher) {
      const { stateRef } = context.use();

      if (typeof patcher === 'function') {
        update(patcher);
      }

      function update(patcher) {
        const { stateRef } = context.use();
        const currentState = stateRef.current();

        stateRef.set(
          key,
          typeof patcher === 'function' ? patcher(currentState?.[key]) : patcher
        );
      }

      return [stateRef.current()[key], update];
    }

    use[SYMBOL_ADD_TO_STATE] = function (stateKey, args) {
      const { stateRef } = context.use();
      key = stateKey;

      if (!Object.prototype.hasOwnProperty.call(stateRef.current(), key)) {
        stateRef.set(
          key,
          typeof initialValue === 'function'
            ? initialValue.apply(null, args)
            : initialValue
        );
      }
    };

    return use;
  }

  function createRef(handlers = {}) {
    let state = {};
    const registeredHandlers = [];

    function current() {
      return state;
    }

    function set(key, value) {
      state = {
        ...state,
        [key]: value,
      };
    }

    function reset() {
      state.length = 0;

      state = {};
      registeredHandlers.forEach(fn => fn());
    }

    const stateRef = {
      current,
      reset,
      set,
    };

    for (const key in handlers) {
      registeredHandlers.push(
        Array.isArray(handlers[key])
          ? context.bind(
              { stateRef },
              handlers[key][0][SYMBOL_ADD_TO_STATE],
              key,
              handlers[key][1]
            )
          : context.bind({ stateRef }, handlers[key][SYMBOL_ADD_TO_STATE], key)
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
