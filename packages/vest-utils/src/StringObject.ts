import optionalFunctionValue from 'optionalFunctionValue';
import type { Stringable } from 'utilityTypes';

// eslint-disable-next-line @typescript-eslint/ban-types
export function StringObject(value?: Stringable): String {
  return new String(optionalFunctionValue(value));
}
