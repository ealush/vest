import { IsolateTest, IsolateTestInput } from 'IsolateTest';
// import { IsolateTypes } from 'IsolateTypes';
import { attemptRunTestObjectByTier } from 'runTest';

export function testObjectIsolate(
  testObjectInput: IsolateTestInput
): IsolateTest {
  return IsolateTest.factory(
    (testObject: IsolateTest) => attemptRunTestObjectByTier(testObject),
    testObjectInput
  );
}
