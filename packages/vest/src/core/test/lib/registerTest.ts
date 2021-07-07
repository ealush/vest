import isPromise from 'isPromise';
import throwError from 'throwError';

import VestTest from 'VestTest';
import addTestToState from 'addTestToState';
import { setPending } from 'pending';
import runAsyncTest from 'runAsyncTest';
import runSyncTest from 'runSyncTest';


/**
 * Registers test, if async - adds to pending array
 */
export default function registerTest(testObject: VestTest): void {
  addTestToState(testObject);

  // Run test callback.
  // If a promise is returned, set as async and
  // Move to pending list.
  const result = runSyncTest(testObject);

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
}
