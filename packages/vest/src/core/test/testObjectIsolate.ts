import { IsolateTest } from 'Isolate';
import { IsolateTypes } from 'IsolateTypes';
import { VestTest } from 'VestTest';
import { attemptRunTestObjectByTier } from 'runTest';

export function testObjectIsolate(testObject: VestTest): VestTest {
  return IsolateTest.create(
    IsolateTypes.TEST,
    () => attemptRunTestObjectByTier(testObject),
    testObject
  ).data;
}
