import { createBus } from 'bus';
import throwError from 'throwError';

import VestTest from 'VestTest';
import ctx from 'ctx';
import { runFieldCallbacks, runDoneCallbacks } from 'runCallbacks';

export function initBus() {
  const bus = createBus();

  bus.on(Events.TEST_COMPLETED, (testObject: VestTest) => {
    if (testObject.isCanceled()) {
      return;
    }

    testObject.done();

    runFieldCallbacks(testObject.fieldName);
    runDoneCallbacks();
  });

  return bus;
}

export function useBus() {
  const context = ctx.useX();

  if (!context.bus) {
    throwError();
  }

  return context.bus;
}

export enum Events {
  TEST_COMPLETED = 'test_completed',
}
