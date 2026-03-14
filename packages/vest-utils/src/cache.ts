import { lengthEquals } from './lengthEquals';
import { longerThan } from './longerThan';
import { DynamicValue, Nullable } from './utilityTypes';
import { dynamicValue, isNullish, isObject } from './vest-utils';

export type CacheConfig = {
  maxSize?: number;
  ttl?: number;
};

/**
 * Creates a cache function
 */
export default function createCache<T = unknown>(
  maxSizeOrConfig?: number | CacheConfig,
): CacheApi<T> {
  const { maxSize, ttl } = getCacheConfig(maxSizeOrConfig);

  const cacheStorage: Array<[unknown[], T, number]> = [];

  const cache = (deps: unknown[], cacheAction: DynamicValue<T>): T => {
    const cacheHit = cache.get(deps);
    // cache hit is not null
    if (cacheHit) return cacheHit[1];

    const result = dynamicValue(cacheAction);
    cacheStorage.unshift([deps.concat(), result, Date.now()]);

    trimToSize();

    return result;
  };

  // invalidate an item in the cache by its dependencies
  cache.invalidate = (deps: any[]): void => {
    const index = findIndex(deps);
    if (index > -1) cacheStorage.splice(index, 1);
  };

  // Retrieves an item from the cache.
  cache.get = (deps: unknown[]): Nullable<[unknown[], T]> => {
    const index = findIndex(deps);
    const item = cacheStorage[index];

    if (!item) return null;

    if (!isNullish(ttl) && Date.now() - item[2] > ttl) {
      cacheStorage.splice(index, 1);
      return null;
    }

    return [item[0], item[1]];
  };

  // sets a value to the cache by its dependencies, updating if a hit is found.
  cache.set = (deps: unknown[], value: T): void => {
    const index = findIndex(deps);
    if (index > -1) {
      cacheStorage[index] = [deps, value, Date.now()];
    } else {
      cacheStorage.unshift([deps, value, Date.now()]);
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

function getCacheConfig(
  maxSizeOrConfig?: number | CacheConfig,
): Required<Pick<CacheConfig, 'maxSize'>> & Pick<CacheConfig, 'ttl'> {
  const config = isObject(maxSizeOrConfig)
    ? maxSizeOrConfig
    : { maxSize: maxSizeOrConfig as number | undefined };
  return {
    maxSize: config.maxSize ?? 1,
    ttl: config.ttl,
  };
}
