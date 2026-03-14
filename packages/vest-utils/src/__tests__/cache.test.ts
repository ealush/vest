import _ from 'lodash';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { cache } from '../vest-utils';

describe('lib: cache', () => {
  let c: ReturnType<typeof cache>;

  beforeEach(() => {
    c = cache();
  });
  it('should return a function', () => {
    expect(typeof cache()).toBe('function');
  });

  it('Should create a new function on each call', () => {
    expect(cache()).not.toBe(cache());
  });

  describe('when cacheaction is a value rather than a function', () => {
    it('should store the value if no hit', () => {
      const res = c([1, 2, 3], 123);
      expect(res).toBe(123);
    });
  });

  describe('on cache miss', () => {
    it('Should call passed cache action function and return its value', () => {
      const cacheAction = vi.fn(() => ({}));
      const res = c([{}], cacheAction);
      expect(cacheAction).toHaveBeenCalledTimes(1);
      expect(res).toBe(cacheAction.mock.results[0].value);
    });
  });

  describe('On cache hit', () => {
    it('Should return cached result', () => {
      const cacheAction = vi.fn(() => {
        Math.random();
      });
      const depsArray = [true, false, {}];
      const res1 = c(depsArray, cacheAction);
      expect(res1).toBe(cacheAction.mock.results[0].value);
      const res2 = c(depsArray, cacheAction);
      expect(res2).toBe(res1);
    });

    it('Should return without calling the cache action', () => {
      const cacheAction = vi.fn();
      const depsArray = [Math.random()];
      c(depsArray, cacheAction);
      expect(cacheAction).toHaveBeenCalledTimes(1);
      c(depsArray, cacheAction);
      expect(cacheAction).toHaveBeenCalledTimes(1);
    });

    it('Should limit cache results to `maxSize`', () => {
      const cacheSize = _.random(5, 10);
      const callCount = _.random(cacheSize, cacheSize + 10);
      const diff = callCount - cacheSize;
      /**
       * Doing a nested check to combat the auto cleanup of the cache.
       * Otherwise, each access to the cache would purge the oldest results
       * and we wouldn't get an accurate read - so instantiating a new cache
       * for each index is a good workaround.
       */
      Array.from({ length: callCount }, (_, i) => {
        const c = cache(/*maxSize*/ cacheSize);
        const results = Array.from({ length: callCount }, (_, j) =>
          c([j], Math.random),
        );

        if (i < diff) {
          // Here we generate a fresh `null` result
          expect(c([i], () => null)).toBeNull();
        } else {
          // Here we retrieve an existing result
          expect(c([i], () => null)).toBe(results[i]);
        }
      });
    });
  });

  describe('Configuration Options', () => {
    it('Should allow setting maxSize through a config object', () => {
      const c = cache({ maxSize: 2 });
      const cb = vi.fn(() => Math.random());

      c([1], cb);
      c([2], cb);
      c([3], cb);

      expect(c.get([1])).toBeNull();
      expect(c.get([2])?.[0]).toEqual([2]);
      expect(c.get([3])?.[0]).toEqual([3]);
    });

    describe('ttl', () => {
      beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(1000);
      });

      afterEach(() => {
        vi.useRealTimers();
      });

      it('Should retain cache item if ttl has not passed', () => {
        const c = cache({ ttl: 50 });
        const cb = vi.fn(() => Math.random());
        c([1], cb);

        vi.setSystemTime(1040); // 40ms later, inside 50ms ttl
        c([1], cb);
        expect(cb).toHaveBeenCalledTimes(1);
        expect(c.get([1])).not.toBeNull();
      });

      it('Should evict cache item if ttl has passed', () => {
        const c = cache({ ttl: 50 });
        const cb = vi.fn(() => Math.random());
        c([1], cb);

        vi.setSystemTime(1060); // 60ms later, exceeded 50ms ttl
        c([1], cb);

        expect(cb).toHaveBeenCalledTimes(2);
      });

      it('get() should return null and evict from storage if ttl has passed', () => {
        const c = cache({ ttl: 50 });
        const cb = vi.fn(() => Math.random());
        c([1], cb);

        vi.setSystemTime(1060);
        expect(c.get([1])).toBeNull();
      });
    });
  });

  it('Should take into account the deps array in its entirety', () => {
    const deps = Array.from({ length: 100 }, () =>
      _.sample([{}, false, Math.random(), true, () => null]),
    );
    const c = cache();
    const res = c([...deps], Math.random);
    expect(c([...deps], () => undefined)).toBe(res);
    const sliced = deps.slice(0, -1);
    expect(c(sliced, () => null)).toBeNull();
  });

  describe('cache.get', () => {
    describe('On cache miss', () => {
      it('Should return null', () => {
        expect(c.get([1, 2, 3])).toBeNull();
        c([1, 2, 3], Math.random);
        expect(c.get([1, 2, '3'])).toBeNull();
      });
    });

    describe('On cache hit', () => {
      it('Should return cached key and item from cache storage', () => {
        const res = c([1, 2, 3], Math.random);
        expect(c.get([1, 2, 3])?.[0]).toEqual([1, 2, 3]);
        expect(c.get([1, 2, 3])?.[1]).toEqual(res);
      });
    });
  });

  describe('cache.set', () => {
    it('Should set a value to the cache storage by its dependencies', () => {
      const deps = [1, 2, 3];
      const res = Math.random();
      c.set(deps, res);
      expect(c.get(deps)?.[1]).toBe(res);
    });

    it('Should update an existing value in the cache storage by its dependencies', () => {
      const deps = [1, 2, 3];
      const res = Math.random();
      c.set(deps, res);
      const updatedRes = Math.random();
      c.set(deps, updatedRes);
      expect(c.get(deps)?.[1]).toBe(updatedRes);
    });
  });

  describe('cache.invalidate', () => {
    it('Should remove cached item from cache storage by its dependencies', () => {
      const deps = [1, 2, 3];
      c(deps, Math.random);
      expect(c.get(deps)).not.toBeNull();
      c.invalidate(deps);
      expect(c.get(deps)).toBeNull();
    });
  });
});
