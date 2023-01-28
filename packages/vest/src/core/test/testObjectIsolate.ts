import { IsolateTypes } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import { Isolate } from 'isolate';
import { attemptRunTestObjectByTier } from 'runTest';

export function testObjectIsolate(testObject: VestTest): VestTest {
  const [selectedIsolate] = Isolate.create(
    IsolateTypes.TEST,
    () => attemptRunTestObjectByTier(testObject),
    testObject
  );

  return selectedIsolate.data as VestTest;
}
