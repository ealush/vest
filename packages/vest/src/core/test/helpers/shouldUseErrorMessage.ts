import { Maybe, isStringValue, isUndefined } from 'vest-utils';

export function shouldUseErrorAsMessage(
  message: Maybe<string>,
  error: unknown,
): error is Maybe<string> {
  // kind of cheating with this safe guard, but it does the job
  return isUndefined(message) && isStringValue(error);
}
