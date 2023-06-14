
import { IsolateTest } from 'IsolateTest';
import { VestTestInspector } from 'VestTestInspector';
import { VestTestMutator } from 'VestTestMutator';
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
    VestTestMutator.cancel(prevRunTestObject);
  }
}
