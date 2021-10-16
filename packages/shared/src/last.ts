import asArray from 'asArray';

export default function last<T>(values: T | T[]): T {
  const valuesArray = asArray(values);

  const { length: l, [l - 1]: lastValue } = valuesArray;

  return lastValue;
}
