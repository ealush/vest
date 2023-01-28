import { IsolateTypes } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import { IsolateTest } from 'isolate';
import { attemptRunTestObjectByTier } from 'runTest';

export function testObjectIsolate(testObject: VestTest): VestTest {
  return IsolateTest.create(
    IsolateTypes.TEST,
    () => attemptRunTestObjectByTier(testObject),
    testObject
  ).data;
}
