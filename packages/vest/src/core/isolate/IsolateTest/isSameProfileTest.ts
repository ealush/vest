import { TIsolateTest } from 'IsolateTest';
import { VestTestInspector } from 'VestTestInspector';
import matchingFieldName from 'matchingFieldName';

export function isSameProfileTest(
  testObject1: TIsolateTest,
  testObject2: TIsolateTest
): boolean {
  const { groupName: gn1 } = VestTestInspector.getData(testObject1);
  const { groupName: gn2, fieldName: fn2 } =
    VestTestInspector.getData(testObject2);
  return (
    matchingFieldName(VestTestInspector.getData(testObject1), fn2) &&
    gn1 === gn2 &&
    testObject1.key === testObject2.key
  );
}
