/**
 * Module: `src/suite/validateSuiteCallback/validateSuiteCallback.ts`.
 *
 * Provides `validateSuiteCallback`-related runtime and type utilities used by `vest`.
 */
import { CB, isFunction, makeResult, Result } from 'vest-utils';

import { ErrorStrings } from '../../errors/ErrorStrings';

export function validateSuiteCallback<T extends CB>(
  suiteCallback: T,
): Result<T, string> {
  if (!isFunction(suiteCallback)) {
    return makeResult.Err(ErrorStrings.SUITE_MUST_BE_INITIALIZED_WITH_FUNCTION);
  }

  return makeResult.Ok(suiteCallback);
}
