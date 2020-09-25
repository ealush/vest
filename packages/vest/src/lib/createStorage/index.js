const createStore = initialValue => {
  const storage = {
    state: null,
  };

  reset();
  return {
    set,
    get,
    reset,
  };

  function set(setter) {
    storage.state =
      typeof setter === 'function' ? setter(storage.state) : setter;
    return get();
  }

  function get() {
    return storage.state;
  }

  function reset() {
    return set(initialValue);
  }
};

export default createStore;
