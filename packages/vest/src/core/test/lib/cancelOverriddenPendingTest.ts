import VestTest from 'VestTest';

import isSameProfileTest from 'isSameProfileTest';

export default function cancelOverriddenPendingTest(
  prevRunTestObject: VestTest,
  currentRunTestObject: VestTest
): void {
  if (
    currentRunTestObject !== prevRunTestObject &&
    isSameProfileTest(prevRunTestObject, currentRunTestObject) &&
    prevRunTestObject.isPending()
  ) {
    prevRunTestObject.cancel();
  }
}
