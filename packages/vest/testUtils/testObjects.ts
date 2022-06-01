import VestTest from 'VestTest';
import { useSetTests } from 'stateHooks';

export function addTestObject(addedTests: VestTest[] | VestTest): void {
  useSetTests(tests => tests.concat(addedTests));
}
