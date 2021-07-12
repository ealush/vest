import { isNotNull } from 'isNull';
import { lengthEquals } from 'lengthEquals';

/**
 * Creates a cache function
 */
export default function createCache(maxSize = 10): {
  <T>(deps: unknown[], cacheAction: (...args: unknown[]) => T): T;
  get(deps: unknown[]): any;
} {
  const cacheStorage: Array<[unknown[], any]> = [];

  /**
   * @param {Any[]} deps  dependency array.
   * @param {Function}    cache action function.
   */
  const cache = <T>(
    deps: unknown[],
    cacheAction: (...args: unknown[]) => T
  ): T => {
    const cacheHit = cache.get(deps);

    if (isNotNull(cacheHit)) {
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
  cache.get = (deps: unknown[]): any =>
    cacheStorage[
      cacheStorage.findIndex(
        ([cachedDeps]) =>
          lengthEquals(deps, cachedDeps.length) &&
          deps.every((dep, i) => dep === cachedDeps[i])
      )
    ] || null;

  return cache;
}
