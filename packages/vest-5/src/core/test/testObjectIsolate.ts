import { IsolateTypes } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import { isolate } from 'isolate';

import { attemptRunTestObjectByTier } from 'runTest';

export function testObjectIsolate(testObject: VestTest): VestTest {
  const [selectedIsolate] = isolate(
    IsolateTypes.TEST,
    () => {
      attemptRunTestObjectByTier(testObject);
    },
    testObject
  );

  return selectedIsolate.data as VestTest;
}
