import _ from 'lodash';

import cache from '.';

describe('lib: cache', () => {
  it('should return a function', () => {
    expect(typeof cache()).toBe('function');
  });

  it('Should create a new function on each call', () => {
    expect(cache()).not.toBe(cache());
  });

  describe('on cache miss', () => {
    it('Should call passed cache action function and return its value', () => {
      const c = cache();
      const cacheAction = jest.fn(() => ({}));
      const res = c([{}], cacheAction);
      expect(cacheAction).toHaveBeenCalledTimes(1);
      expect(res).toBe(cacheAction.mock.results[0].value);
    });
  });

  describe('On cache hit', () => {
    it('Should return cached result', () => {
      const c = cache();
      const cacheAction = jest.fn(() => {
        Math.random();
      });
      const depsArray = [true, false, {}];
      const res1 = c(depsArray, cacheAction);
      expect(res1).toBe(cacheAction.mock.results[0].value);
      const res2 = c(depsArray, cacheAction);
      expect(res2).toBe(res1);
    });

    it('Should return without calling the cache action', () => {
      const c = cache();
      const cacheAction = jest.fn();
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
          c([j], Math.random)
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
  it('Should take into account the deps array in its entirety', () => {
    const deps = Array.from({ length: 100 }, () =>
      _.sample([{}, false, Math.random(), true, () => null])
    );
    const c = cache();
    const res = c([...deps], Math.random);
    expect(c([...deps])).toBe(res);
    const sliced = deps.slice(0, -1);
    expect(c(sliced, () => null)).toBeNull();
  });
});
