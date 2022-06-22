import asArray from 'asArray';

export default function last<T>(values: T | T[]): T {
  const valuesArray = asArray(values);

  return valuesArray[valuesArray.length - 1];
}
