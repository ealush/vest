import { TIsolateTest } from 'IsolateTest';
import { VestTestInspector } from 'VestTestInspector';
import { VestTestMutator } from 'VestTestMutator';
import { isSameProfileTest } from 'isSameProfileTest';

export default function cancelOverriddenPendingTest(
  prevRunTestObject: TIsolateTest,
  currentRunTestObject: TIsolateTest
): void {
  if (
    currentRunTestObject !== prevRunTestObject &&
    isSameProfileTest(prevRunTestObject, currentRunTestObject) &&
    VestTestInspector.isPending(prevRunTestObject)
  ) {
    VestTestMutator.cancel(prevRunTestObject);
  }
}
