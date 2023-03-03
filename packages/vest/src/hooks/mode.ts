import { IsolateTest } from 'IsolateTest';
import { useMode } from 'SuiteContext';
import { hasErrorsByTestObjects } from 'hasFailuresByTestObjects';

export enum Modes {
  ALL,
  EAGER,
}

/**
 * Sets the suite to "eager" (fail fast) mode.
 * Eager mode will skip running subsequent tests of a failing fields.
 *
 * @example
 *  // in the following example, the second test of username will not run
 *  // if the first test of username failed.
 * const suite = create((data) => {
 *  eager();
 *
 *  test('username', 'username is required', () => {
 *   enforce(data.username).isNotBlank();
 *  });
 *
 *  test('username', 'username is too short', () => {
 *   enforce(data.username).longerThan(2);
 *  });
 * });
 */
// @vx-allow use-use
export function eager() {
  const [, setMode] = useMode();

  setMode(Modes.EAGER);
}

function useIsMode(mode: Modes): boolean {
  const [currentMode] = useMode();

  return currentMode === mode;
}

function useIsEager(): boolean {
  return useIsMode(Modes.EAGER);
}

export function useShouldSkipBasedOnMode(testObject: IsolateTest): boolean {
  return useIsEager() && hasErrorsByTestObjects(testObject.fieldName);
}
