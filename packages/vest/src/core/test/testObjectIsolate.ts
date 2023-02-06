import { IsolateTest, IsolateTestInput } from 'IsolateTest';
import { attemptRunTestObjectByTier } from 'runTest';

export function testObjectIsolate(
  testObjectInput: IsolateTestInput
): IsolateTest {
  return IsolateTest.factory(
    (testObject: IsolateTest) => attemptRunTestObjectByTier(testObject),
    testObjectInput
  );
}
