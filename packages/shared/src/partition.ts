export default function partition<T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => boolean
): [T[], T[]] {
  return array.reduce(
    (partitions: [T[], T[]], value, number) => {
      partitions[predicate(value, number, array) ? 0 : 1].push(value);
      return partitions;
    },
    [[], []]
  );
}
