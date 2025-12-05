import dynamicValue from './dynamicValue';
import type { Stringable } from './utilityTypes';

export function StringObject(value?: Stringable): String {
  return new String(dynamicValue(value));
}
