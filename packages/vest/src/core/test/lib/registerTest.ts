import isPromise from 'isPromise';
import throwError from 'throwError';

import VestTest from 'VestTest';
import runAsyncTest from 'runAsyncTest';
import runSyncTest from 'runSyncTest';
import { useBus, Events } from 'vestBus';
/**
 * Registers test, if async - adds to pending array
 */
export default function registerTest(testObject: VestTest): void {
  const bus = useBus();

  // Run test callback.
  // If a promise is returned, set as async and
  // Move to pending list.
  const result = runSyncTest(testObject);

  try {
    // try catch for safe property access
    // in case object is an enforce chain
    if (isPromise(result)) {
      testObject.asyncTest = result;
      testObject.setPending();
      runAsyncTest(testObject);
    } else {
      bus.emit(Events.TEST_COMPLETED, testObject);
    }
  } catch (e) {
    throwError(
      `Your test function ${testObject.fieldName} returned a value. Only "false" or Promise returns are supported.`
    );
  }
}
