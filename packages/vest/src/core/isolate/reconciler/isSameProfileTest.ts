import { IsolateTest } from 'IsolateTest';

export function isSameProfileTest(
  testObject1: IsolateTest,
  testObject2: IsolateTest
): boolean {
  return (
    testObject1.fieldName === testObject2.fieldName &&
    testObject1.groupName === testObject2.groupName &&
    testObject1.key === testObject2.key
  );
}
