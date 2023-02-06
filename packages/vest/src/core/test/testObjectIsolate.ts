import { IsolateTest, IsolateTestInput } from 'IsolateTest';
import { IsolateTypes } from 'IsolateTypes';
import { attemptRunTestObjectByTier } from 'runTest';

export function testObjectIsolate(
  testObjectInput: IsolateTestInput
): IsolateTest {
  return IsolateTest.create(
    IsolateTypes.TEST,
    (testObject: IsolateTest) => attemptRunTestObjectByTier(testObject),
    testObjectInput
  );
}
