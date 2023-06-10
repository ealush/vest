import invariant from 'invariant';

import { isNullish } from 'isNullish';
import { Nullish } from 'utilityTypes';

export function nonnullish<T>(value: Nullish<T>, error?: string): T {
  invariant(!isNullish(value), error);

  return value;
}
