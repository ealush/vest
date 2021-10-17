import VestTest from 'VestTest';
import { useTestObjects } from 'stateHooks';

export function emptyTestObjects(): void {
  const [, setTestObjects] = useTestObjects();
  setTestObjects(({ prev }) => ({ prev, current: [] }));
}

export function setTestObjects(...args: VestTest[]): void {
  const [, setTestObjects] = useTestObjects();
  setTestObjects(({ prev }) => ({ prev, current: [...args] }));
}

export function addTestObject(addedTests: VestTest[] | VestTest): void {
  const [, setTestObjects] = useTestObjects();

  setTestObjects(({ prev, current }) => ({
    prev,
    current: current.concat(addedTests),
  }));
}
