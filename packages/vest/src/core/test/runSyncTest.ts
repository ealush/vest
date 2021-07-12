import isStringValue from 'isStringValue';
import { isUndefined } from 'isUndefined';

import VestTest, { TTestResult } from 'VestTest';
import context from 'ctx';
/**
 * Runs sync tests - or extracts promise.
 */
export default function runSyncTest(testObject: VestTest): TTestResult {
  return context.run({ currentTest: testObject }, () => {
    let result;
    try {
      result = testObject.testFn();
    } catch (e) {
      if (isUndefined(testObject.message) && isStringValue(e)) {
        testObject.message = e;
      }
      result = false;
    }

    if (result === false) {
      testObject.fail();
    }

    return result;
  });
}
