import { isStringValue, isUndefined } from 'vest-utils';

export function shouldUseErrorAsMessage(
  message: string | void,
  error: unknown
): error is string {
  // kind of cheating with this safe guard, but it does the job
  return isUndefined(message) && isStringValue(error);
}
