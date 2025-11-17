import { TIsolateTest } from './IsolateTest';
import { VestTest } from './VestTest';
import matchingFieldName from '../../test/helpers/matchingFieldName';

export function isSameProfileTest(
  testObject1: TIsolateTest,
  testObject2: TIsolateTest,
): boolean {
  const gn1 = VestTest.getGroupName(testObject1);
  const { fieldName: fn2 } = VestTest.getData(testObject2);
  const gn2 = VestTest.getGroupName(testObject2);
  return (
    matchingFieldName(VestTest.getData(testObject1), fn2) &&
    gn1 === gn2 &&
    // Specifically using == here. The reason is that when serializing
    // suite result, empty key gets removed, but it can also be null.
    testObject1.key == testObject2.key
  );
}
