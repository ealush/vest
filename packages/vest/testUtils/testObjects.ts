import VestTest from 'VestTest';
import { useSetTests } from 'stateHooks';

export function emptyTestObjects(): void {
  useSetTests(() => []);
}

export function setTestObjects(...args: VestTest[]): void {
  useSetTests(() => [...args]);
}

export function addTestObject(addedTests: VestTest[] | VestTest): void {
  useSetTests(tests => tests.concat(addedTests));
}
