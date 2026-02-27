/**
 * Module: `src/core/test/helpers/shouldUseErrorMessage.ts`.
 *
 * Provides `shouldUseErrorMessage`-related runtime and type utilities used by `vest`.
 */
import {
  Maybe,
  isStringValue,
  isUndefined,
  makeResult,
  Result,
} from 'vest-utils';

export function shouldUseErrorAsMessage(
  message: Maybe<string>,
  error: unknown,
): Result<boolean> {
  // kind of cheating with this safe guard, but it does the job
  return makeResult.Ok(isUndefined(message) && isStringValue(error));
}
