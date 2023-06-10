import { lengthEquals } from 'lengthEquals';
import { longerThan } from 'longerThan';
import { Nullable } from 'utilityTypes';

/**
 * Creates a cache function
 */
export default function createCache<T = unknown>(maxSize = 1): CacheApi<T> {
  const cacheStorage: Array<[unknown[], T]> = [];

  const cache = (
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
  cache.get = (deps: unknown[]): Nullable<[unknown[], T]> =>
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

export type CacheApi<T = unknown> = {
  (deps: unknown[], cacheAction: (...args: unknown[]) => T): T;
  get(deps: unknown[]): Nullable<[unknown[], T]>;
  invalidate(item: any): void;
};
