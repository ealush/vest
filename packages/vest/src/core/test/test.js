import VestTest from 'VestTest';
import addTestToState from 'addTestToState';
import context from 'ctx';
import { isExcluded } from 'exclusive';
import isFunction from 'isFunction';
import isPromise from 'isPromise';
import isStringValue from 'isStringValue';
import { isUndefined } from 'isUndefined';
import { setPending } from 'pending';
import runAsyncTest from 'runAsyncTest';
import bindTestEach from 'test.each';
import bindTestMemo from 'test.memo';
import throwError from 'throwError';
import withArgs from 'withArgs';

/**
 * Runs sync tests - or extracts promise.
 * @param {VestTest} testObject VestTest instance.
 * @returns {*} Result from test callback.
 */
const sync = testObject =>
  context.run({ currentTest: testObject }, () => {
    let result;
    try {
      result = testObject.testFn();
    } catch (e) {
      if (isUndefined(testObject.statement) && isStringValue(e)) {
        testObject.statement = e;
      }
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

  if (isExcluded(testObject)) {
    testObject.markSkipped();
    return;
  }

  // Run test callback.
  // If a promise is returned, set as async and
  // Move to pending list.
  const result = sync(testObject);

  try {
    // try catch for safe property access
    // in case object is an enforce chain
    if (isPromise(result)) {
      testObject.asyncTest = result;
      setPending(testObject);
      runAsyncTest(testObject);
    }
  } catch {
    if (__DEV__) {
      throwError(
        `Your test function ${testObject.fieldName} returned ${JSON.stringify(
          result
        )}. Only "false" or a Promise are supported. Return values may cause unexpected behavior.`
      );
    }
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
function test(fieldName, args) {
  const [testFn, statement] = args.reverse();

  const { groupName } = context.use();
  const testObject = new VestTest({
    fieldName,
    group: groupName,
    statement,
    testFn,
  });

  if (!isFunction(testFn)) {
    return;
  }

  register(testObject);

  return testObject;
}

const exportedTest = withArgs(test);

bindTestEach(exportedTest);
bindTestMemo(exportedTest);

/* eslint-disable jest/no-export */
export default exportedTest;
