import VestTest from 'VestTest';

export default function isSameProfileTest(
  testObject1: VestTest,
  testObject2: VestTest
): boolean {
  return (
    testObject1.fieldName === testObject2.fieldName &&
    testObject1.groupName === testObject2.groupName
  );
}
