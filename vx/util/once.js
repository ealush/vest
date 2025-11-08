function once(callback) {
  let ran = false;

  return (...args) => {
    if (!ran) {
      try {
        callback(...args);
      } catch {} // eslint-disable-line no-empty

      ran = true;
    }
  };
}

module.exports = once;
