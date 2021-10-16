import { isNotEmpty } from 'isEmpty';

import asArray from 'asArray';
import type { NestedArray } from 'nestedArray';

export default function drillArray<T>(
  values: NestedArray<T> | T,
  path: number[]
): NestedArray<T> {
  const valuesArray = asArray(values);

  const [first, ...rest] = asArray(path);

  const value = valuesArray[first];

  if (isNotEmpty(rest)) {
    return drillArray(value, rest);
  }

  return asArray(value);
}
