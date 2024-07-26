import { TIsolateTest } from '@/core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '@/core/isolate/IsolateTest/VestTest';
import { isSameProfileTest } from './isSameProfileTest';

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
