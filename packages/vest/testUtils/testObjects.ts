import VestTest from 'VestTest';
import { useTestsOrdered } from 'stateHooks';

export function emptyTestObjects(): void {
  const [, setTestObjects] = useTestsOrdered();
  setTestObjects(() => []);
}

export function setTestObjects(...args: VestTest[]): void {
  const [, setTestObjects] = useTestsOrdered();
  setTestObjects(() => [...args]);
}
