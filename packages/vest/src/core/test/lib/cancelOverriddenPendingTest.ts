import VestTest from 'VestTest';
import isSameProfileTest from 'isSameProfileTest';

export default function cancelOverriddenPendingTest(
  prevRunTestObject: VestTest,
  currentRunTestObject: VestTest
): void {
  if (
    isSameProfileTest(prevRunTestObject, currentRunTestObject) &&
    prevRunTestObject.isPending() &&
    currentRunTestObject !== prevRunTestObject
  ) {
    prevRunTestObject.cancel();
  }
}
