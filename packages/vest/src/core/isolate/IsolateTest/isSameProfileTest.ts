import { TIsolateTest } from 'IsolateTest';
import { VestTestInspector } from 'VestTestInspector';
import matchingFieldName from 'matchingFieldName';

export function isSameProfileTest(
  testObject1: TIsolateTest,
  testObject2: TIsolateTest
): boolean {
  const t1 = VestTestInspector.getData(testObject1);
  const { fieldName: fieldName2, groupName: groupName2 } =
    VestTestInspector.getData(testObject2);

  return (
    matchingFieldName(t1, fieldName2) &&
    t1.groupName === groupName2 &&
    testObject1.key === testObject2.key
  );
}
