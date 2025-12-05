import dynamicValue from './dynamicValue';
import type { Stringable } from './utilityTypes';

export default function invariant(
  condition: any,

  message?: String | Stringable,
): asserts condition {
  if (condition) {
    return;
  }

  // If message is a string object (rather than string literal)
  // Throw the value directly as a string
  // Alternatively, throw an error with the message
  throw message instanceof String
    ? message.valueOf()
    : new Error(message ? dynamicValue(message) : message);
}
