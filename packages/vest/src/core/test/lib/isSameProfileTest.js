export default function isSameProfileTest(testObject1, testObject2) {
  return (
    testObject1.fieldName === testObject2.fieldName &&
    testObject1.groupName === testObject2.groupName
  );
}
