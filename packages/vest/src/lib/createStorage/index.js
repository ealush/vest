const createStore = initialState => {
  const storage = {
    state: null,
  };

  register();
  return {
    set,
    get,
    register,
  };

  function set(setter) {
    storage.state = setter(get());
    return get();
  }

  function get() {
    return storage.state;
  }

  function register() {
    return set(state => state ?? initialState());
  }
};

export default createStore;
