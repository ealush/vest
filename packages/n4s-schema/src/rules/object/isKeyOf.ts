export function isKeyOf(key: string | number | symbol, obj: object): boolean {
  return (
    obj != null &&
    typeof obj === 'object' &&
    Object.prototype.hasOwnProperty.call(obj, key)
  );
}

export function isNotKeyOf(
  key: string | number | symbol,
  obj: object,
): boolean {
  return !(
    obj != null &&
    typeof obj === 'object' &&
    Object.prototype.hasOwnProperty.call(obj, key)
  );
}
