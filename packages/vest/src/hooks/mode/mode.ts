import { Modes } from 'Modes';
import VestTest from 'VestTest';
import ctx from 'ctx';
import { hasErrorsByTestObjects } from 'hasFailuresByTestObjects';

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
  setMode(Modes.EAGER);
}

export function shouldSkipBasedOnMode(testObject: VestTest): boolean {
  return isEager() && hasErrorsByTestObjects(testObject.fieldName);
}

function isEager(): boolean {
  return isMode(Modes.EAGER);
}

function isMode(mode: Modes): boolean {
  const { mode: currentMode } = ctx.useX();

  return currentMode[0] === mode;
}

function setMode(nextMode: Modes): void {
  const { mode } = ctx.useX();

  mode[0] = nextMode;
}
