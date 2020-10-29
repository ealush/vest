import VestTest from 'VestTest';
import createCache from 'cache';
import context from 'ctx';
import { isExcluded } from 'exclusive';
import isFunction from 'isFunction';
import { setPending } from 'pending';
import runAsyncTest from 'runAsyncTest';
import useSuiteId from 'useSuiteId';
import useTestObjects from 'useTestObjects';

let cache;

/**
 * Stores test object inside suite state.
 * @param {VestTest} testObject
 */
const addTestToState = testObject => {
  useTestObjects(testObjects => testObjects.concat(testObject));
};

/**
 * Runs sync tests - or extracts promise.
 * @param {VestTest} testObject VestTest instance.
 * @returns {*} Result from test callback.
 */
const sync = testObject =>
  context.run({ currentTest: testObject }, () => {
    let result;
    try {
      result = testObject.testFn.apply(testObject);
    } catch (e) {
      result = false;
    }

    if (result === false) {
      testObject.fail();
    }

    return result;
  });

/**
 * Registers test, if async - adds to pending array
 * @param {VestTest} testObject   A VestTest Instance.
 */
const register = testObject => {
  addTestToState(testObject);

  // Run test callback.
  // If a promise is returned, set as async and
  // Move to pending list.
  const result = sync(testObject);

  try {
    // try catch for safe property access
    // in case object is an enforce chain
    if (isFunction(result?.then)) {
      testObject.asyncTest = result;
      setPending(testObject);
      runAsyncTest(testObject);
    }
  } catch {
    /* FUTURE: throw an error here in dev mode:
     * Your test function ${testObject.fieldName} returned
     * a value other than `false` or a Promise. Return values
     * are not supported and may cause unexpected behavior.
     */
  }
};

/**
 * Test function used by consumer to provide their own validations.
 * @param {String} fieldName            Name of the field to test.
 * @param {String} [statement]          The message returned in case of a failure.
 * @param {function} testFn             The actual test callback.
 * @return {VestTest}                 A VestTest instance.
 *
 * **IMPORTANT**
 * Changes to this function need to reflect in test.memo as well
 */
const test = (fieldName, ...args) => {
  const [testFn, statement] = args.reverse();

  const { groupName } = context.use();
  const testObject = new VestTest({
    fieldName,
    group: groupName,
    statement,
    testFn,
  });

  if (isExcluded(testObject)) {
    return testObject;
  }

  if (!isFunction(testFn)) {
    return;
  }

  register(testObject);

  return testObject;
};

/**
 * Caches, or returns an already cached test call
 * @param {String} fieldName    Name of the field to test.
 * @param {String} [statement]  The message returned in case of a failure.
 * @param {function} testFn     The actual test callback.
 * @param {any[]} deps          Dependency array.
 * @return {VestTest}           A VestTest instance.

 */
test.memo = (fieldName, ...args) => {
  cache = cache || createCache(100);

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

/* eslint-disable jest/no-export */
export default test;
