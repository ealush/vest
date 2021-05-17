import context from 'ctx';
import isStringValue from 'isStringValue';
import { isUndefined } from 'isUndefined';
/**
 * Runs sync tests - or extracts promise.
 * @param {VestTest} testObject VestTest instance.
 * @returns {*} Result from test callback.
 */
export default function runSyncTest(testObject) {
  return context.run({ currentTest: testObject }, () => {
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
}
