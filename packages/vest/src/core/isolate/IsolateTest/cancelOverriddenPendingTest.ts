import { IsolateTest } from 'IsolateTest';
import { isSameProfileTest } from 'isSameProfileTest';

export default function cancelOverriddenPendingTest(
  prevRunTestObject: IsolateTest,
  currentRunTestObject: IsolateTest
): void {
  if (
    currentRunTestObject !== prevRunTestObject &&
    isSameProfileTest(prevRunTestObject, currentRunTestObject) &&
    prevRunTestObject.isPending()
  ) {
    prevRunTestObject.cancel();
  }
}
