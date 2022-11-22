import { IsolateTypes } from 'IsolateTypes';

import { useGroupName } from 'SuiteContext';
import { TestFn } from 'TestTypes';
import { VestTest } from 'VestTest';
import { isolate } from 'isolate';
import { attemptRunTestObjectByTier } from 'runTest';

function vestTest(fieldName: string, message: string, cb: TestFn): VestTest;
function vestTest(fieldName: string, cb: TestFn): VestTest;
function vestTest(
  fieldName: string,
  ...args: [message: string, cb: TestFn] | [cb: TestFn]
): VestTest {
  const [cb, message] = args.reverse() as [TestFn, string | undefined];

  const groupName = useGroupName();

  const testObject = new VestTest(fieldName, cb, {
    message,
    groupName,
  });

  isolate(
    IsolateTypes.TEST,
    () => {
      attemptRunTestObjectByTier(testObject);
    },
    testObject
  );

  return testObject;
}

export { vestTest as test };
