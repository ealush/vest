import { makeResult, Result } from 'vest-utils';

import { useMode } from '../../core/context/SuiteContext';
import { WithFieldName } from '../../core/test/TestTypes';
import { useHasErrorsByTestObjects } from '../../suiteResult/selectors/hasFailuresByTestObjects';

import { Modes } from './Modes';

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

function useIsMode(mode: Modes): Result<boolean> {
  const [currentMode] = useMode();

  return makeResult.Ok(currentMode === mode);
}

function useIsEager(): Result<boolean> {
  return useIsMode(Modes.EAGER);
}

function useIsOne(): Result<boolean> {
  return useIsMode(Modes.ONE);
}

export function useShouldSkipBasedOnMode(testData: WithFieldName): boolean {
  if (useIsOne().unwrap()) {
    return useHasErrorsByTestObjects();
  }

  if (useIsEager().unwrap()) {
    return useHasErrorsByTestObjects(testData.fieldName);
  }

  return false;
}
