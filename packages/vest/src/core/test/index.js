import { isExcluded } from '../../hooks/exclusive';
import createCache from '../../lib/cache';
import runWithContext from '../../lib/runWithContext';
import singleton from '../../lib/singleton';
import getSuiteState from '../state/getSuiteState';
import patch from '../state/patch';
import VestTest from './lib/VestTest';
import { setPending } from './lib/pending';

let cache;

/**
 * Stores test object inside suite state.
 * @param {String} suiteId
 * @param {VestTest} testObject
 */
const addTestToState = (suiteId, testObject) => {
  patch(suiteId, state => ({
    ...state,
    testObjects: state.testObjects.concat(testObject),
  }));
};

/**
 * Runs sync tests - or extracts promise.
 * @param {VestTest} testObject VestTest instance.
 * @returns {*} Result from test callback.
 */
const sync = testObject =>
  runWithContext({ currentTest: testObject }, () => {
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
  addTestToState(testObject.suiteId, testObject);

  // Run test callback.
  // If a promise is returned, set as async and
  // Move to pending list.
  const result = sync(testObject);

  try {
    // try catch for safe property access
    // in case object is an enforce chain
    if (typeof result?.then === 'function') {
      testObject.asyncTest = result;
      setPending(testObject.suiteId, testObject);
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
 */
const test = (fieldName, ...args) => {
  const { length, [length - 2]: statement, [length - 1]: testFn } = args;

  const ctx = singleton.useContext();

  const testObject = new VestTest({
    fieldName,
    group: ctx.groupName,
    statement,
    suiteId: ctx.suiteId,
    testFn,
  });

  if (isExcluded(getSuiteState(ctx.suiteId), testObject)) {
    return testObject;
  }

  if (typeof testFn !== 'function') {
    return;
  }

  register(testObject);

  return testObject;
};

test.memo = (fieldName, ...args) => {
  cache = cache ?? createCache(100);

  const { length: l, [l - 3]: msg, [l - 2]: testFn, [l - 1]: deps } = args;

  const ctx = singleton.useContext();
  const dependencies = [ctx.suiteId, fieldName].concat(deps);

  const cached = cache.get(dependencies);

  if (cached === null) {
    // Cache miss. Start fresh
    return cache(dependencies, () => test(fieldName, msg, testFn));
  }

  const [, testObject] = cached;

  if (isExcluded(getSuiteState(ctx.suiteId), testObject)) {
    return testObject;
  }

  addTestToState(testObject.suiteId, testObject);

  if (typeof testObject?.asyncTest?.then === 'function') {
    setPending(testObject.suiteId, testObject);
  }

  return testObject;
};

/* eslint-disable jest/no-export */
export default test;
