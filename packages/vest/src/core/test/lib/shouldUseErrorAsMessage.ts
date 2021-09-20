import { isStringValue } from 'isStringValue';
import { isUndefined } from 'isUndefined';

export default function shouldUseErrorAsMessage(
  message: string | void,
  error: any
): boolean {
  return isUndefined(message) && isStringValue(error);
}
