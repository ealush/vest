// Checks if value is a key that exists in the given object
export function isKeyOf(key: string | number | symbol, obj: object): boolean {
  return (
    obj != null &&
    typeof obj === 'object' &&
    Object.prototype.hasOwnProperty.call(obj, key)
  );
}

// Checks if value is not a key in the given object
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
