import { TIsolateTest } from '@/core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '@/core/isolate/IsolateTest/VestTest';
import matchingFieldName from '@/core/test/helpers/matchingFieldName';

export function isSameProfileTest(
  testObject1: TIsolateTest,
  testObject2: TIsolateTest,
): boolean {
  const { groupName: gn1 } = VestTest.getData(testObject1);
  const { groupName: gn2, fieldName: fn2 } = VestTest.getData(testObject2);
  return (
    matchingFieldName(VestTest.getData(testObject1), fn2) &&
    gn1 === gn2 &&
    // Specifically using == here. The reason is that when serializing
    // suite result, empty key gets removed, but it can also be null.
    testObject1.key == testObject2.key
  );
}
