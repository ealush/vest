import addTestToState from 'addTestToState';
import createCache from 'cache';
import { isExcluded } from 'exclusive';
import isFunction from 'isFunction';
import { setPending } from 'pending';
import runAsyncTest from 'runAsyncTest';
import useSuiteId from 'useSuiteId';

/* eslint-disable jest/no-export */
export default function bindTestMemo(test) {
  const cache = createCache(100);

  /**
   * Caches, or returns an already cached test call
   * @param {String} fieldName    Name of the field to test.
   * @param {String} [statement]  The message returned in case of a failure.
   * @param {function} testFn     The actual test callback.
   * @param {any[]} deps          Dependency array.
   * @return {VestTest}           A VestTest instance.
   */
  test.memo = (fieldName, ...args) => {
    const [suiteId] = useSuiteId();

    const [deps, testFn, msg] = args.reverse();

    // Implicit dependency for more specificity
    const dependencies = [suiteId.id, fieldName].concat(deps);

    const cached = cache.get(dependencies);

    if (cached === null) {
      // Cache miss. Start fresh
      return cache(dependencies, () => test(fieldName, msg, testFn));
    }

    const [, testObject] = cached;

    if (isExcluded(testObject)) {
      return testObject;
    }

    addTestToState(testObject);

    if (isFunction(testObject?.asyncTest?.then)) {
      setPending(testObject);
      runAsyncTest(testObject);
    }

    return testObject;
  };
}
