import VestTest from 'VestTest';
import { useTestObjects } from 'stateHooks';

export function emptyTestObjects(): void {
  const [, setTestObjects] = useTestObjects();
  setTestObjects(() => []);
}

export function setTestObjects(...args: VestTest[]): void {
  const [, setTestObjects] = useTestObjects();
  setTestObjects(() => [...args]);
}
