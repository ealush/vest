import { IsolateTest, IsolateTestInput } from 'IsolateTest';
import { useAttemptRunTestObjectByTier } from 'runTest';

export function useTestObjectIsolate(
  testObjectInput: IsolateTestInput
): IsolateTest {
  return IsolateTest.create(
    (testObject: IsolateTest) => useAttemptRunTestObjectByTier(testObject),
    testObjectInput
  );
}
