export default function concatTruthy<T>(
  ...values: Array<T | T[]>
): Array<T | T[]> {
  return ([] as Array<T | T[]>).concat(...values).filter(Boolean) as Array<
    T | T[]
  >;
}
