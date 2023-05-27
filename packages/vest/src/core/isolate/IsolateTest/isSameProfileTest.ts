import { IsolateTest } from 'IsolateTest';
import matchingFieldName from 'matchingFieldName';

export function isSameProfileTest(
  testObject1: IsolateTest,
  testObject2: IsolateTest
): boolean {
  return (
    matchingFieldName(testObject1, testObject2.fieldName) &&
    testObject1.groupName === testObject2.groupName &&
    testObject1.key === testObject2.key
  );
}
