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
    for (let i = 0; i < cacheStorage.length; i++) {
      const [cachedDeps, cachedResult] = cacheStorage[i];

      if (
        cachedDeps.length === deps.length &&
        deps.every((dep, i) => dep === cachedDeps[i])
      ) {
        return cachedResult;
      }
    }

    const result = cacheAction();

    cacheStorage.unshift([[...deps], result]);

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
    ] ?? null;

  return cache;
};

export default createCache;
