/**
 * Creates a cache function
 * @param {number} [maxSize] Max cache size
 * @return {Function} cache function
 */
const createCache = (maxSize = 10) => {
  const cacheStorage = [];

  /**
   * @param {Any[]} deps  dependency array.
   * @param {Function}    cache action function.
   */
  const cache = (deps, cacheAction) => {
    const cacheHit = cache.get(deps);

    if (cacheHit !== null) {
      return cacheHit[1];
    }

    const result = cacheAction();

    cacheStorage.unshift([deps.concat(), result]);

    if (cacheStorage.length > maxSize) {
      cacheStorage.length = maxSize;
    }

    return result;
  };

  /**
   * Retrieves an item from the cache.
   * @param {deps} deps Dependency array
   */
  cache.get = deps =>
    cacheStorage[
      cacheStorage.findIndex(
        ([cachedDeps]) =>
          deps.length === cachedDeps.length &&
          deps.every((dep, i) => dep === cachedDeps[i])
      )
    ] || null;

  return cache;
};

export default createCache;
