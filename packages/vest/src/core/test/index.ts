import { isExcluded } from '../../hooks/exclusive';
import runWithContext from '../../lib/runWithContext';
import singleton from '../../lib/singleton';
import getSuiteState from '../state/getSuiteState';
import patch from '../state/patch';
import VestTest, { VestTestType } from './lib/VestTest';
import { setPending } from './lib/pending';

/**
 * Stores test object inside suite state.
 */
const addTestToState = (suiteId: string, testObject: VestTestType) => {
  patch(suiteId, state => ({
    ...state,
    testObjects: state.testObjects.concat(testObject),
  }));
};

/**
 * Runs sync tests - or extracts promise.
 */
const sync = (testObject: VestTestType) =>
  runWithContext({ currentTest: testObject }, () => {
    let result;
    try {
      // @ts-ignore
      result = testObject.testFn(testObject);
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
 */
const register = (testObject: VestTestType) => {
  addTestToState(testObject.suiteId, testObject);

  // Run test callback.
  // If a promise is returned, set as async and
  // Move to pending list.
  const result = sync(testObject);
  if (typeof result?.then === 'function') {
    testObject.asyncTest = result;
    setPending(testObject.suiteId, testObject);
  }
};

// @ts-ignore
const test = (fieldName: string, ...args): VestTestType => {
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

export default test;
