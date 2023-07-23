import { TIsolateTest } from 'IsolateTest';
import { VestTest } from 'VestTest';
import matchingFieldName from 'matchingFieldName';

export function isSameProfileTest(
  testObject1: TIsolateTest,
  testObject2: TIsolateTest
): boolean {
  const { groupName: gn1 } = VestTest.getData(testObject1);
  const { groupName: gn2, fieldName: fn2 } = VestTest.getData(testObject2);
  return (
    matchingFieldName(VestTest.getData(testObject1), fn2) &&
    gn1 === gn2 &&
    testObject1.key === testObject2.key
  );
}
