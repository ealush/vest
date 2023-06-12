import { IsolateTest } from 'IsolateTest';
import { VestTestInspector } from 'VestTestInspector';
import { isSameProfileTest } from 'isSameProfileTest';

export default function cancelOverriddenPendingTest(
  prevRunTestObject: IsolateTest,
  currentRunTestObject: IsolateTest
): void {
  if (
    currentRunTestObject !== prevRunTestObject &&
    isSameProfileTest(prevRunTestObject, currentRunTestObject) &&
    VestTestInspector.isPending(prevRunTestObject)
  ) {
    prevRunTestObject.cancel();
  }
}
