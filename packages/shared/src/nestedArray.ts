import { isArray } from 'isArrayValue';
import { isNotNull } from 'isNull';

import asArray from 'asArray';
import defaultTo from 'defaultTo';
import last from 'last';

export type NestedArray<T> = Array<NestedArray<T> | T>;

// This is kind of a map/filter in one function.
// Normally, behaves like a nested-array map,
// but returning `null` will drop the element from the array
export function transform<T>(
  array: NestedArray<T>,
  cb: (value: T) => NestedArray<T> | T | null
): NestedArray<T> {
  const res = [];
  for (const v of array) {
    if (isArray(v)) {
      res.push(transform(v, cb));
    } else {
      const output = cb(v);

      if (isNotNull(output)) {
        res.push(output);
      }
    }
  }
  return res as NestedArray<T>;
}

export function valueAtPath<T>(
  array: NestedArray<T>,
  path: number[]
): T | NestedArray<T> {
  return getCurrent(array, path)[last(path)];
}

export function setValueAtPath<T>(
  array: NestedArray<T>,
  path: number[],
  value: NestedArray<T> | T
): NestedArray<T> {
  const current = getCurrent(array, path);

  current[last(path)] = value;
  return array;
}

export function flatten<T>(values: NestedArray<T> | T): T[] {
  return asArray(values).reduce((acc, value) => {
    if (isArray(value)) {
      return (acc as NestedArray<T>).concat(flatten(value));
    }

    return asArray(acc).concat(value);
  }, [] as T[]) as T[];
}

export function getCurrent<T>(
  array: NestedArray<T>,
  path: number[]
): NestedArray<T> {
  let current: NestedArray<T> = array;
  for (const p of path.slice(0, -1)) {
    current[p] = defaultTo(current[p], []);
    current = current[p] as NestedArray<T>;
  }
  return current;
}
