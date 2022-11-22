import { VestTest } from 'VestTest';
import { hasErrorsByTestObjects } from 'hasFailuresByTestObjects';

import { useMode } from 'SuiteContext';

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
export function eager() {
  const [, setMode] = useMode();

  setMode(Modes.EAGER);
}

function isMode(mode: Modes): boolean {
  const [currentMode] = useMode();

  return currentMode === mode;
}

function isEager(): boolean {
  return isMode(Modes.EAGER);
}

export function shouldSkipBasedOnMode(testObject: VestTest): boolean {
  return isEager() && hasErrorsByTestObjects(testObject.fieldName);
}
