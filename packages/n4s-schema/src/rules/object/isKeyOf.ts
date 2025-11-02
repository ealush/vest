export function isKeyOf(
  obj: object,
): (key: string | number | symbol) => boolean {
  return (key: string | number | symbol) =>
    obj != null &&
    typeof obj === 'object' &&
    Object.prototype.hasOwnProperty.call(obj, key);
}

export function isNotKeyOf(
  obj: object,
): (key: string | number | symbol) => boolean {
  return (key: string | number | symbol) =>
    !(
      obj != null &&
      typeof obj === 'object' &&
      Object.prototype.hasOwnProperty.call(obj, key)
    );
}
