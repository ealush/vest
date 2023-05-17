import { useMode } from 'SuiteContext';
import { WithFieldName } from 'TestTypes';
import { hasErrorsByTestObjects } from 'hasFailuresByTestObjects';

export enum Modes {
  EAGER = 'EAGER',
  ALL = 'ALL',
  ONE = 'ONE',
}

/**
 * Sets the current execution mode for the current suite.
 *
 * Supported modes:
 * - `EAGER` - (default) Runs all tests, but stops on first failure for each given field.
 * - `ALL` - Runs all tests, regardless of failures.
 * - `ONE` - Stops suite execution on first failure of any field.
 *
 * @example
 * ```js
 * import {Modes, create} from 'vest';
 *
 * const suite = create('suite_name', () => {
 *  vest.mode(Modes.ALL);
 *
 *  // ...
 * });
 * ```
 * @param 'ALL' | 'EAGER' | 'ONE' mode - The mode to set.
 */

// @vx-allow use-use
export function mode(mode: Modes): void {
  const [, setMode] = useMode();

  setMode(mode);
}

function useIsMode(mode: Modes): boolean {
  const [currentMode] = useMode();

  return currentMode === mode;
}

function useIsEager(): boolean {
  return useIsMode(Modes.EAGER);
}

function useIsOne(): boolean {
  return useIsMode(Modes.ONE);
}

export function useShouldSkipBasedOnMode(testObject: WithFieldName): boolean {
  if (useIsOne()) {
    return hasErrorsByTestObjects();
  }

  if (useIsEager()) {
    return hasErrorsByTestObjects(testObject.fieldName);
  }

  return false;
}
