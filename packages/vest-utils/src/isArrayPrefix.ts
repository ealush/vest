/**
 * Whether every entry in `prefix` equals the entry at the same position in
 * `value`. Empty arrays are prefixes of every array.
 */
export function isArrayPrefix<T>(
  prefix: readonly T[],
  value: readonly T[],
  equals: (left: T, right: T) => boolean = Object.is,
): boolean {
  return (
    prefix.length <= value.length &&
    prefix.every((entry, index) => equals(entry, value[index]))
  );
}
