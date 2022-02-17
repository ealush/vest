import { lengthEquals } from 'lengthEquals';
import { longerThan } from 'longerThan';

/**
 * Creates a cache function
 */
export default function createCache(maxSize = 1): {
  <T>(deps: unknown[], cacheAction: (...args: unknown[]) => T): T;
  get(deps: unknown[]): any;
  invalidate(item: any): void;
} {
  const cacheStorage: Array<[unknown[], any]> = [];

  const cache = <T>(
    deps: unknown[],
    cacheAction: (...args: unknown[]) => T
  ): T => {
    const cacheHit = cache.get(deps);
    // cache hit is not null
    if (cacheHit) return cacheHit[1];

    const result = cacheAction();
    cacheStorage.unshift([deps.concat(), result]);

    if (longerThan(cacheStorage, maxSize)) cacheStorage.length = maxSize;

    return result;
  };

  // invalidate an item in the cache by its dependencies
  cache.invalidate = (deps: any[]): void => {
    const index = findIndex(deps);
    if (index > -1) cacheStorage.splice(index, 1);
  };

  // Retrieves an item from the cache.
  cache.get = (deps: unknown[]): [unknown[], any] | null =>
    cacheStorage[findIndex(deps)] || null;

  return cache;

  function findIndex(deps: unknown[]): number {
    return cacheStorage.findIndex(
      ([cachedDeps]) =>
        lengthEquals(deps, cachedDeps.length) &&
        deps.every((dep, i) => dep === cachedDeps[i])
    );
  }
}
