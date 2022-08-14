import optionalFunctionValue from 'optionalFunctionValue';
import type { Stringable } from 'utilityTypes';

export default function invariant(
  condition: any,
  // eslint-disable-next-line @typescript-eslint/ban-types
  message?: String | Stringable
): asserts condition {
  if (condition) {
    return;
  }

  // If message is a string object (rather than string literal)
  // Throw the value directly as a string
  // Alternatively, throw an error with the message
  throw message instanceof String
    ? message.valueOf()
    : new Error(message ? optionalFunctionValue(message) : message);
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function StringObject(value?: Stringable): String {
  return new String(optionalFunctionValue(value));
}
