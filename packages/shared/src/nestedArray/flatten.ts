import { isArray } from 'isArrayValue';

import asArray from 'asArray';
import type { NestedArray } from 'nestedArray';

export default function flatten<T>(values: NestedArray<T> | T): T[] {
  return asArray(values).reduce((acc, value) => {
    if (isArray(value)) {
      return (acc as NestedArray<T>).concat(flatten(value));
    }

    return asArray(acc).concat(value);
  }, [] as T[]) as T[];
}
