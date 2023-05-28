import invariant from 'invariant';

import { isNullish } from 'isNullish';

export function nonnullish<T>(value: T | null | undefined, error?: string): T {
  invariant(!isNullish(value), error);

  return value;
}
