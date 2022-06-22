/**
 * A safe hasOwnProperty access
 */
export default function hasOwnProperty<T>(
  obj: T,
  key: string | number | symbol
): key is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
