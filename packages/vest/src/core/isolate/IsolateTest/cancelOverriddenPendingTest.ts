import { TIsolateTest } from 'IsolateTest';
import { VestTest } from 'VestTest';
import { isSameProfileTest } from 'isSameProfileTest';

export default function cancelOverriddenPendingTest(
  prevRunTestObject: TIsolateTest,
  currentRunTestObject: TIsolateTest,
): void {
  if (
    currentRunTestObject !== prevRunTestObject &&
    isSameProfileTest(prevRunTestObject, currentRunTestObject) &&
    VestTest.isPending(prevRunTestObject)
  ) {
    VestTest.cancel(prevRunTestObject);
  }
}
