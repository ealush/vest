/**
 * Wraps a callback so it only runs once, ignoring subsequent calls.
 * @template {(...args: any[]) => any} T
 * @param {T} callback Callback to execute once.
 * @returns {(...args: Parameters<T>) => void} Memoized function.
 */
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
