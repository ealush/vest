import VestTest, { TestResult } from 'VestTest';
import context from 'ctx';
import shouldUseErrorAsMessage from 'shouldUseErrorAsMessage';
/**
 * Runs sync tests - or extracts promise.
 */
export default function runSyncTest(testObject: VestTest): TestResult {
  return context.run({ currentTest: testObject }, () => {
    let result;
    try {
      result = testObject.testFn();
    } catch (e) {
      if (shouldUseErrorAsMessage(testObject.message, e)) {
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
