import VestTest from 'VestTest';
import { isStringValue, isPromise } from 'vest-utils';

import ctx from 'ctx';
import { useRefreshTestObjects, useStateRef } from 'stateHooks';
import { useBus, Events } from 'vestBus';
/**
 * Runs async test.
 */
export default function runAsyncTest(testObject: VestTest): void {
  const { asyncTest, message } = testObject;

  if (!isPromise(asyncTest)) return;

  const { emit } = useBus();

  const stateRef = useStateRef();
  const done = ctx.bind({ stateRef }, () => {
    // invalidating the "produce" cache
    useRefreshTestObjects();
    emit(Events.TEST_COMPLETED, testObject);
  });
  const fail = ctx.bind({ stateRef }, (rejectionMessage?: string) => {
    if (testObject.isCanceled()) {
      return;
    }

    testObject.message = isStringValue(rejectionMessage)
      ? rejectionMessage
      : message;
    testObject.fail();

    done();
  });

  asyncTest.then(done, fail);
}
