// Checks if value exists in the given object's values
export function isValueOf<T = any>(value: T, obj: Record<string, T>): boolean {
  return (
    obj != null && typeof obj === 'object' && Object.values(obj).includes(value)
  );
}

// Checks if value does not exist in the given object's values
export function isNotValueOf<T = any>(
  value: T,
  obj: Record<string, T>,
): boolean {
  return (
    obj != null &&
    typeof obj === 'object' &&
    !Object.values(obj).includes(value)
  );
}
