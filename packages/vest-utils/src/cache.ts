import { dynamicValue } from 'vest-utils';

import { lengthEquals } from 'lengthEquals';
import { longerThan } from 'longerThan';
import { DynamicValue, Nullable } from 'utilityTypes';

/**
 * Creates a cache function
 */
export default function createCache<T = unknown>(maxSize = 1): CacheApi<T> {
  const cacheStorage: Array<[unknown[], T]> = [];

  const cache = (deps: unknown[], cacheAction: DynamicValue<T>): T => {
    const cacheHit = cache.get(deps);
    // cache hit is not null
    if (cacheHit) return cacheHit[1];

    const result = dynamicValue(cacheAction);
    cacheStorage.unshift([deps.concat(), result]);

    trimToSize();

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

  // sets a value to the cache by its dependencies, updating if a hit is found.
  cache.set = (deps: unknown[], value: T): void => {
    const index = findIndex(deps);
    if (index > -1) {
      cacheStorage[index] = [deps, value];
    } else {
      cacheStorage.unshift([deps, value]);
    }
    trimToSize();
  };

  return cache;

  function trimToSize() {
    if (longerThan(cacheStorage, maxSize)) {
      cacheStorage.length = maxSize;
    }
  }

  function findIndex(deps: unknown[]): number {
    return cacheStorage.findIndex(
      ([cachedDeps]) =>
        lengthEquals(deps, cachedDeps.length) &&
        deps.every((dep, i) => dep === cachedDeps[i]),
    );
  }
}

export type CacheApi<T = unknown> = {
  (deps: unknown[], cacheAction: DynamicValue<T>): T;
  get(deps: unknown[]): Nullable<[unknown[], T]>;
  set(deps: unknown[], value: T): void;
  invalidate(item: any): void;
};
