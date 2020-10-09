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
        const prevState = stateRef.prev();

        stateRef.set(
          key,
          typeof patcher === 'function'
            ? patcher(currentState?.[key], prevState?.[key])
            : patcher
        );
      }

      return [stateRef.current()[key], update];
    }

    use[SYMBOL_ADD_TO_STATE] = function (stateKey, ...args) {
      const { stateRef } = context.use();
      key = stateKey;

      if (!Object.prototype.hasOwnProperty.call(stateRef.current(), key)) {
        stateRef.set(
          key,
          typeof initialValue === 'function'
            ? initialValue(...args)
            : initialValue
        );
      }
    };

    return use;
  }

  function createRef(handlers = {}) {
    const state = [];

    function current() {
      return state[0];
    }

    function prev() {
      return state[1];
    }

    function set(key, value) {
      state[0] = {
        ...state[0],
        [key]: value,
      };
    }

    function reset() {
      state.length = 0;

      unshift();
    }

    function unshift() {
      context.run({ stateRef }, () => {
        state.unshift({});
        for (const key in handlers) {
          if (!Object.prototype.hasOwnProperty.call(current(), key)) {
            if (Array.isArray(handlers[key])) {
              /*
                state.createRef({
                  useSuiteId: [useSuiteId, [id, name]],
                })
              */
              handlers[key][0][SYMBOL_ADD_TO_STATE](key, ...handlers[key][1]);
            } else {
              /*
                state.createRef({
                  useSuiteId,
                });
              */
              handlers[key][SYMBOL_ADD_TO_STATE](key);
            }
          }
        }
      });
    }

    const stateRef = {
      current,
      prev,
      reset,
      set,
      unshift,
    };

    context.run({ stateRef }, reset);

    return stateRef;
  }

  return {
    registerHandler,
    createRef,
  };
})();
